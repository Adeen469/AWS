from collections import defaultdict, deque
from datetime import datetime, timedelta

from app.models import Disruption, ItineraryDependency, ItineraryItem

_ORDER = {"UNAFFECTED": 0, "FLAGGED": 1, "AT_RISK": 2, "BROKEN": 3}


def analyze_impact(
    items: list[ItineraryItem],
    dependencies: list[ItineraryDependency],
    disruption: Disruption,
) -> dict:
    by_id = {item.id: item for item in items}
    if disruption.affected_item_id not in by_id:
        raise ValueError("Disruption references an itinerary item outside this trip")

    downstream: dict[str, list[ItineraryDependency]] = defaultdict(list)
    for edge in dependencies:
        downstream[edge.upstream_item_id].append(edge)

    indegree = {item_id: 0 for item_id in by_id}
    for edge in dependencies:
        if edge.upstream_item_id not in by_id or edge.downstream_item_id not in by_id:
            raise ValueError("Dependency references an itinerary item outside this trip")
        indegree[edge.downstream_item_id] += 1
    ready = deque(item_id for item_id, count in indegree.items() if count == 0)
    topological_order = []
    while ready:
        item_id = ready.popleft()
        topological_order.append(item_id)
        for edge in downstream[item_id]:
            indegree[edge.downstream_item_id] -= 1
            if indegree[edge.downstream_item_id] == 0:
                ready.append(edge.downstream_item_id)
    if len(topological_order) != len(by_id):
        raise ValueError("Itinerary dependency graph contains a cycle")

    source_id = disruption.affected_item_id
    unavailable = disruption.disruption_type in {
        "FLIGHT_CANCELLED",
        "TRANSFER_UNAVAILABLE",
        "ACTIVITY_CANCELLED",
        "HOTEL_UNAVAILABLE",
    }
    affected = {source_id}
    broken = {source_id} if unavailable else set()
    at_risk = set()
    shift: dict[str, int] = {source_id: max(0, disruption.delay_minutes)}
    for upstream_id in topological_order:
        if upstream_id not in affected:
            continue
        upstream = by_id[upstream_id]
        for edge in downstream[upstream_id]:
            downstream_item = by_id[edge.downstream_item_id]
            affected.add(downstream_item.id)
            if unavailable:
                if downstream_item.flexibility == "FIXED":
                    broken.add(downstream_item.id)
                else:
                    at_risk.add(downstream_item.id)
                continue
            required_buffer = max(
                edge.min_required_buffer_minutes,
                downstream_item.required_buffer_minutes,
            )
            required_start = upstream.end_time + timedelta(
                minutes=shift[upstream_id] + required_buffer
            )
            needed_shift = max(
                0,
                int((required_start - downstream_item.start_time).total_seconds() // 60),
            )
            if needed_shift and downstream_item.flexibility == "FIXED":
                broken.add(downstream_item.id)
                shift[downstream_item.id] = 0
            else:
                shift[downstream_item.id] = max(shift.get(downstream_item.id, 0), needed_shift)

    results = []
    for item_id in (item.id for item in items if item.id in affected):
        delay = shift.get(item_id, 0)
        item = by_id[item_id]
        if item_id in broken:
            state, reason, available_buffer = (
                "BROKEN",
                "The disrupted service or a required dependency is unavailable.",
                -delay,
            )
        elif item_id == source_id and delay == 0:
            state, reason, available_buffer = "FLAGGED", "Service is disrupted.", None
        elif item_id in at_risk:
            state, reason, available_buffer = (
                "AT_RISK",
                "An upstream service is unavailable.",
                None,
            )
        elif delay == 0:
            state, reason, available_buffer = "UNAFFECTED", "", item.required_buffer_minutes
        elif item_id == source_id:
            state, reason, available_buffer = "FLAGGED", "Service is disrupted.", -delay
        else:
            available_buffer = max(0, item.required_buffer_minutes - delay)
            state, reason = "AT_RISK", "Item must move to preserve its required buffer."
        shifted_start = item.start_time + timedelta(minutes=delay)
        shifted_end = item.end_time + timedelta(minutes=delay)
        if item.flexibility == "FIXED" and item_id in broken:
            shifted_start, shifted_end = item.start_time, item.end_time
        results.append(
            {
                "item_id": item_id,
                "title": item.title,
                "status": state,
                "reason": reason,
                "buffer_minutes": available_buffer,
                "required_buffer_minutes": item.required_buffer_minutes,
                "expected_start_time": shifted_start,
                "expected_end_time": shifted_end,
            }
        )

    overall = max(
        (row["status"] for row in results), key=lambda state: _ORDER[state], default="UNAFFECTED"
    )
    return {"overall_status": overall, "items": results}


def validate_dependency_graph(
    trip_id: str,
    existing: list[ItineraryDependency],
    upstream_item_id: str,
    downstream_item_id: str,
    item_ids: set[str],
) -> None:
    if upstream_item_id == downstream_item_id:
        raise ValueError("An item cannot depend on itself")
    if upstream_item_id not in item_ids or downstream_item_id not in item_ids:
        raise ValueError("Dependencies must reference items in the same trip")
    adjacency: dict[str, list[str]] = defaultdict(list)
    for edge in existing:
        if edge.trip_id == trip_id:
            adjacency[edge.upstream_item_id].append(edge.downstream_item_id)
    adjacency[upstream_item_id].append(downstream_item_id)

    pending = [downstream_item_id]
    visited = set()
    while pending:
        node = pending.pop()
        if node == upstream_item_id:
            raise ValueError("Dependency graph contains a cycle")
        if node not in visited:
            visited.add(node)
            pending.extend(adjacency[node])


def build_reschedule_plan(
    items: list[ItineraryItem],
    dependencies: list[ItineraryDependency],
    item_id: str,
    new_start_time: datetime,
) -> list[dict[str, str]] | None:
    by_id = {item.id: item for item in items}
    target = by_id.get(item_id)
    if (
        target is None
        or target.flexibility != "FLEXIBLE"
        or target.booked_status not in {"PLANNED", "PENDING"}
        or new_start_time <= target.start_time
    ):
        return None

    indegree = {key: 0 for key in by_id}
    outgoing: dict[str, list[ItineraryDependency]] = defaultdict(list)
    for edge in dependencies:
        if edge.upstream_item_id not in by_id or edge.downstream_item_id not in by_id:
            return None
        outgoing[edge.upstream_item_id].append(edge)
        indegree[edge.downstream_item_id] += 1
    ready = deque(key for key, count in indegree.items() if count == 0)
    ordered = []
    while ready:
        current_id = ready.popleft()
        ordered.append(current_id)
        for edge in outgoing[current_id]:
            indegree[edge.downstream_item_id] -= 1
            if indegree[edge.downstream_item_id] == 0:
                ready.append(edge.downstream_item_id)
    if len(ordered) != len(by_id):
        return None

    start_times = {key: item.start_time for key, item in by_id.items()}
    end_times = {key: item.end_time for key, item in by_id.items()}
    duration = target.end_time - target.start_time
    start_times[item_id] = new_start_time
    end_times[item_id] = new_start_time + duration
    for upstream_id in ordered:
        for edge in outgoing[upstream_id]:
            downstream = by_id[edge.downstream_item_id]
            required_buffer = max(
                edge.min_required_buffer_minutes,
                downstream.required_buffer_minutes,
            )
            required_start = end_times[upstream_id] + timedelta(minutes=required_buffer)
            if required_start > start_times[downstream.id]:
                if downstream.flexibility != "FLEXIBLE" or downstream.booked_status not in {
                    "PLANNED",
                    "PENDING",
                }:
                    return None
                delay = required_start - start_times[downstream.id]
                start_times[downstream.id] += delay
                end_times[downstream.id] += delay

    return [
        {"item_id": key, "start_time": start_times[key].isoformat()}
        for key in ordered
        if start_times[key] != by_id[key].start_time
    ]
