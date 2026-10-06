from datetime import UTC, datetime, timedelta

import pytest
from app.models import Disruption, ItineraryDependency, ItineraryItem
from app.services.constraints import (
    analyze_impact,
    build_reschedule_plan,
    validate_dependency_graph,
)


def item(
    item_id: str,
    *,
    fixed: bool = False,
    buffer: int = 30,
    start_hour: int = 19,
    start_minute: int = 0,
) -> ItineraryItem:
    start = datetime(2026, 10, 10, start_hour, start_minute, tzinfo=UTC)
    return ItineraryItem(
        id=item_id,
        trip_id="trip",
        item_type="ACTIVITY",
        title=item_id,
        start_time=start,
        end_time=start + timedelta(hours=1),
        estimated_cost=0,
        currency="USD",
        booked_status="PLANNED",
        flexibility="FIXED" if fixed else "FLEXIBLE",
        required_buffer_minutes=buffer,
    )


def test_delay_propagates_through_multiple_dependencies_and_breaks_fixed_item():
    flight = item("flight", start_hour=16)
    transfer = item("transfer", start_hour=17, start_minute=30)
    dinner = item("dinner", fixed=True)
    disruption = Disruption(
        id="disruption",
        trip_id="trip",
        affected_item_id="flight",
        disruption_type="FLIGHT_DELAY",
        severity="HIGH",
        details="",
        delay_minutes=180,
    )
    edges = [
        ItineraryDependency(
            id="one",
            trip_id="trip",
            upstream_item_id="flight",
            downstream_item_id="transfer",
            min_required_buffer_minutes=30,
        ),
        ItineraryDependency(
            id="two",
            trip_id="trip",
            upstream_item_id="transfer",
            downstream_item_id="dinner",
            min_required_buffer_minutes=30,
        ),
    ]

    impact = analyze_impact([flight, transfer, dinner], edges, disruption)

    assert impact["overall_status"] == "BROKEN"
    assert [row["item_id"] for row in impact["items"]] == ["flight", "transfer", "dinner"]
    assert impact["items"][-1]["status"] == "BROKEN"
    assert impact["items"][1]["expected_start_time"] == transfer.start_time + timedelta(minutes=180)
    assert impact["items"][-1]["expected_start_time"] == dinner.start_time


def test_delay_is_absorbed_by_existing_buffer():
    flight = item("flight", start_hour=16)
    transfer = item("transfer", start_hour=18)
    edge = ItineraryDependency(
        id="edge",
        trip_id="trip",
        upstream_item_id="flight",
        downstream_item_id="transfer",
        min_required_buffer_minutes=30,
    )
    disruption = Disruption(
        id="disruption",
        trip_id="trip",
        affected_item_id="flight",
        disruption_type="FLIGHT_DELAY",
        severity="LOW",
        details="",
        delay_minutes=30,
    )

    impact = analyze_impact([flight, transfer], [edge], disruption)

    assert impact["overall_status"] == "FLAGGED"
    assert impact["items"][1]["status"] == "UNAFFECTED"
    assert impact["items"][1]["expected_start_time"] == transfer.start_time


def test_cancelled_upstream_service_marks_dependent_items_at_risk():
    flight = item("flight", start_hour=16, fixed=True)
    transfer = item("transfer", start_hour=18)
    edge = ItineraryDependency(
        id="edge",
        trip_id="trip",
        upstream_item_id="flight",
        downstream_item_id="transfer",
        min_required_buffer_minutes=30,
    )
    disruption = Disruption(
        id="disruption",
        trip_id="trip",
        affected_item_id="flight",
        disruption_type="FLIGHT_CANCELLED",
        severity="HIGH",
        details="Cancelled",
        delay_minutes=0,
    )

    impact = analyze_impact([flight, transfer], [edge], disruption)

    assert impact["items"][0]["status"] == "BROKEN"
    assert impact["items"][1]["status"] == "AT_RISK"


def test_impact_rejects_disruption_outside_loaded_trip():
    with pytest.raises(ValueError, match="outside this trip"):
        analyze_impact([], [], Disruption(affected_item_id="foreign"))


def test_dependency_cycle_is_rejected():
    existing = [
        ItineraryDependency(
            id="edge",
            trip_id="trip",
            upstream_item_id="a",
            downstream_item_id="b",
            min_required_buffer_minutes=0,
        )
    ]
    with pytest.raises(ValueError, match="cycle"):
        validate_dependency_graph("trip", existing, "b", "a", {"a", "b"})


def test_dependencies_must_reference_items_from_same_trip():
    with pytest.raises(ValueError, match="same trip"):
        validate_dependency_graph("trip", [], "foreign", "local", {"local"})


def test_recovery_plan_cascades_to_preserve_downstream_buffer():
    transfer, activity = item("transfer"), item("activity")
    edge = ItineraryDependency(
        id="edge",
        trip_id="trip",
        upstream_item_id="transfer",
        downstream_item_id="activity",
        min_required_buffer_minutes=30,
    )
    plan = build_reschedule_plan(
        [transfer, activity],
        [edge],
        "transfer",
        transfer.start_time + timedelta(hours=1),
    )

    assert plan == [
        {
            "item_id": "transfer",
            "start_time": (transfer.start_time + timedelta(hours=1)).isoformat(),
        },
        {
            "item_id": "activity",
            "start_time": (activity.start_time + timedelta(hours=2, minutes=30)).isoformat(),
        },
    ]


def test_recovery_plan_rejects_cascade_through_fixed_downstream_item():
    transfer, activity = item("transfer"), item("activity", fixed=True)
    edge = ItineraryDependency(
        id="edge",
        trip_id="trip",
        upstream_item_id="transfer",
        downstream_item_id="activity",
        min_required_buffer_minutes=30,
    )

    assert (
        build_reschedule_plan(
            [transfer, activity],
            [edge],
            "transfer",
            transfer.start_time + timedelta(hours=1),
        )
        is None
    )
