import json
from contextlib import asynccontextmanager
from datetime import UTC, datetime, timedelta
from decimal import Decimal
from uuid import uuid4

from fastapi import Depends, FastAPI, HTTPException, Request, Response, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import Actor, get_actor
from app.db import Base, engine, get_db
from app.models import (
    AuditEvent,
    Booking,
    Disruption,
    ItineraryDependency,
    ItineraryItem,
    Notification,
    RecoveryOption,
    Trip,
    TripPreference,
)
from app.schemas import (
    AssistantQuestion,
    DisruptionWrite,
    ItemPatch,
    ItemRead,
    ItemWrite,
    PreferencesRead,
    PreferencesWrite,
    RecoveryRead,
    TripCreate,
    TripPatch,
    TripRead,
)
from app.services.ai import AIProviderError, ai_gateway
from app.services.constraints import (
    analyze_impact,
    build_reschedule_plan,
    validate_dependency_graph,
)

settings = get_settings()


def _utc(value):
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


@asynccontextmanager
async def lifespan(_: FastAPI):
    if settings.auto_create_schema and settings.database_url.startswith("sqlite"):
        Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="TourFlow AI API", version="0.1.0", lifespan=lifespan)
if settings.allowed_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE"],
        allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    )


@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    request_id = str(uuid4())
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


@app.exception_handler(HTTPException)
async def http_error_handler(request: Request, exc: HTTPException):
    detail = exc.detail if isinstance(exc.detail, dict) else {}
    return JSONResponse(
        status_code=exc.status_code,
        headers=exc.headers,
        content={
            "error": {
                "code": detail.get("code", "HTTP_ERROR"),
                "message": detail.get("message", "Request could not be completed"),
                "request_id": request.state.request_id,
                "details": detail.get("details", {}),
            }
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    errors = [
        {"location": error["loc"], "message": error["msg"], "type": error["type"]}
        for error in exc.errors()
    ]
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Request validation failed",
                "request_id": request.state.request_id,
                "details": {"errors": errors},
            }
        },
    )


def fail(code: str, message: str, http_status: int = 400) -> HTTPException:
    return HTTPException(status_code=http_status, detail={"code": code, "message": message})


def audit(
    db: Session,
    actor: Actor,
    event_type: str,
    entity_type: str,
    entity_id: str,
    trip_id: str | None,
    payload: dict | None = None,
) -> None:
    db.add(
        AuditEvent(
            actor_user_id=actor.user_id,
            trip_id=trip_id,
            entity_type=entity_type,
            entity_id=entity_id,
            event_type=event_type,
            payload=json.dumps(payload or {}, separators=(",", ":"), default=str),
        )
    )


def get_trip(db: Session, trip_id: str, actor: Actor, *, write: bool = False) -> Trip:
    trip = (
        db.scalar(select(Trip).where(Trip.id == trip_id).with_for_update())
        if write
        else db.get(Trip, trip_id)
    )
    if trip is None:
        raise fail("NOT_FOUND", "Trip not found", 404)
    allowed = (
        actor.role == "admin"
        or trip.traveler_id == actor.user_id
        or (actor.role == "coordinator" and trip.coordinator_id == actor.user_id)
        or (actor.role == "operator" and trip.coordinator_id == actor.user_id)
    )
    if not allowed or (write and actor.role == "vendor"):
        raise fail("FORBIDDEN", "You are not authorized to access this trip", 403)
    return trip


def require_operator(actor: Actor) -> None:
    if actor.role not in {"operator", "coordinator", "admin"}:
        raise fail("FORBIDDEN", "Operator permission required", 403)


def ai_error(exc: AIProviderError) -> HTTPException:
    not_configured = str(exc) == "AI provider is not configured"
    return fail(
        "AI_PROVIDER_ERROR",
        str(exc),
        503 if not_configured else 502,
    )


def load_trip_items(db: Session, trip_id: str) -> list[ItineraryItem]:
    return list(
        db.scalars(
            select(ItineraryItem)
            .where(ItineraryItem.trip_id == trip_id)
            .order_by(ItineraryItem.start_time, ItineraryItem.id)
        )
    )


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/v1/trips", response_model=TripRead, status_code=status.HTTP_201_CREATED)
def create_trip(data: TripCreate, actor: Actor = Depends(get_actor), db: Session = Depends(get_db)):
    trip = Trip(traveler_id=actor.user_id, **data.model_dump())
    db.add(trip)
    db.flush()
    audit(db, actor, "TRIP_CREATED", "trip", trip.id, trip.id)
    db.commit()
    db.refresh(trip)
    return trip


@app.get("/api/v1/trips", response_model=list[TripRead])
def list_trips(actor: Actor = Depends(get_actor), db: Session = Depends(get_db)):
    if actor.role == "vendor":
        raise fail("FORBIDDEN", "Vendor trip access is not enabled", 403)
    query = select(Trip)
    if actor.role == "traveler":
        query = query.where(Trip.traveler_id == actor.user_id)
    elif actor.role in {"coordinator", "operator"}:
        query = query.where(Trip.coordinator_id == actor.user_id)
    return list(db.scalars(query.order_by(Trip.created_at.desc())))


@app.get("/api/v1/trips/{trip_id}", response_model=TripRead)
def read_trip(trip_id: str, actor: Actor = Depends(get_actor), db: Session = Depends(get_db)):
    return get_trip(db, trip_id, actor)


@app.patch("/api/v1/trips/{trip_id}", response_model=TripRead)
def update_trip(
    trip_id: str, data: TripPatch, actor: Actor = Depends(get_actor), db: Session = Depends(get_db)
):
    trip = get_trip(db, trip_id, actor, write=True)
    changes = data.model_dump(exclude_unset=True)
    for key, value in changes.items():
        setattr(trip, key, value)
    start_date = changes.get("start_date", trip.start_date)
    end_date = changes.get("end_date", trip.end_date)
    if end_date <= start_date:
        raise fail("VALIDATION_ERROR", "end_date must be after start_date")
    trip.version += 1
    audit(db, actor, "TRIP_UPDATED", "trip", trip.id, trip.id, {"fields": list(changes)})
    db.commit()
    db.refresh(trip)
    return trip


@app.put("/api/v1/trips/{trip_id}/preferences", response_model=PreferencesRead)
def put_preferences(
    trip_id: str,
    data: PreferencesWrite,
    actor: Actor = Depends(get_actor),
    db: Session = Depends(get_db),
):
    trip = get_trip(db, trip_id, actor, write=True)
    preferences = db.get(TripPreference, trip_id)
    values = data.model_dump()
    if preferences is None:
        preferences = TripPreference(trip_id=trip_id, **values)
        db.add(preferences)
    else:
        for key, value in values.items():
            setattr(preferences, key, value)
    trip.version += 1
    db.commit()
    db.refresh(preferences)
    return preferences


@app.get("/api/v1/trips/{trip_id}/itinerary", response_model=list[ItemRead])
def get_itinerary(trip_id: str, actor: Actor = Depends(get_actor), db: Session = Depends(get_db)):
    get_trip(db, trip_id, actor)
    return load_trip_items(db, trip_id)


@app.post(
    "/api/v1/trips/{trip_id}/itinerary/items",
    response_model=ItemRead,
    status_code=status.HTTP_201_CREATED,
)
def create_item(
    trip_id: str,
    data: ItemWrite,
    actor: Actor = Depends(get_actor),
    db: Session = Depends(get_db),
):
    trip = get_trip(db, trip_id, actor, write=True)
    depends_on = data.depends_on
    values = data.model_dump(exclude={"depends_on"})
    if values["currency"] != trip.currency:
        raise fail("VALIDATION_ERROR", "Item currency must match trip currency")
    item = ItineraryItem(trip_id=trip_id, **values)
    db.add(item)
    db.flush()
    items = load_trip_items(db, trip_id)
    item_ids = {row.id for row in items}
    existing = list(
        db.scalars(select(ItineraryDependency).where(ItineraryDependency.trip_id == trip_id))
    )
    try:
        for upstream_id in depends_on:
            validate_dependency_graph(trip_id, existing, upstream_id, item.id, item_ids)
            edge = ItineraryDependency(
                trip_id=trip_id,
                upstream_item_id=upstream_id,
                downstream_item_id=item.id,
                min_required_buffer_minutes=values["required_buffer_minutes"],
            )
            db.add(edge)
            existing.append(edge)
    except ValueError as exc:
        db.rollback()
        raise fail("VALIDATION_ERROR", str(exc)) from exc
    trip.version += 1
    audit(db, actor, "ITINERARY_ITEM_CREATED", "itinerary_item", item.id, trip_id)
    db.commit()
    db.refresh(item)
    return item


@app.patch("/api/v1/trips/{trip_id}/itinerary/items/{item_id}", response_model=ItemRead)
def update_item(
    trip_id: str,
    item_id: str,
    data: ItemPatch,
    actor: Actor = Depends(get_actor),
    db: Session = Depends(get_db),
):
    trip = get_trip(db, trip_id, actor, write=True)
    item = db.get(ItineraryItem, item_id)
    if item is None or item.trip_id != trip_id:
        raise fail("NOT_FOUND", "Itinerary item not found", 404)
    if item.booked_status not in {"PLANNED", "PENDING"}:
        raise fail("CONFLICT", "Booked items cannot be edited", 409)
    changes = data.model_dump(exclude_unset=True)
    for key, value in changes.items():
        setattr(item, key, value)
    if item.end_time <= item.start_time:
        raise fail("VALIDATION_ERROR", "end_time must be after start_time")
    trip.version += 1
    audit(db, actor, "ITINERARY_UPDATED", "itinerary_item", item.id, trip_id)
    db.commit()
    db.refresh(item)
    return item


@app.delete("/api/v1/trips/{trip_id}/itinerary/items/{item_id}", status_code=204)
def delete_item(
    trip_id: str,
    item_id: str,
    actor: Actor = Depends(get_actor),
    db: Session = Depends(get_db),
):
    trip = get_trip(db, trip_id, actor, write=True)
    item = db.get(ItineraryItem, item_id)
    if item is None or item.trip_id != trip_id:
        raise fail("NOT_FOUND", "Itinerary item not found", 404)
    if item.booked_status not in {"PLANNED", "PENDING"}:
        raise fail("CONFLICT", "Booked items cannot be deleted", 409)
    db.delete(item)
    trip.version += 1
    audit(db, actor, "ITINERARY_ITEM_DELETED", "itinerary_item", item_id, trip_id)
    db.commit()
    return Response(status_code=204)


@app.post("/api/v1/trips/{trip_id}/itinerary/validate")
def validate_itinerary(
    trip_id: str, actor: Actor = Depends(get_actor), db: Session = Depends(get_db)
):
    get_trip(db, trip_id, actor)
    items = load_trip_items(db, trip_id)
    dependencies = list(
        db.scalars(select(ItineraryDependency).where(ItineraryDependency.trip_id == trip_id))
    )
    issues = []
    for edge in dependencies:
        upstream, downstream = (
            db.get(ItineraryItem, edge.upstream_item_id),
            db.get(ItineraryItem, edge.downstream_item_id),
        )
        if upstream is None or downstream is None:
            issues.append({"code": "MISSING_DEPENDENCY_ITEM", "edge_id": edge.id})
        elif (
            upstream.end_time + timedelta(minutes=edge.min_required_buffer_minutes)
            > downstream.start_time
        ):
            issues.append(
                {
                    "code": "INSUFFICIENT_BUFFER",
                    "upstream_item_id": upstream.id,
                    "downstream_item_id": downstream.id,
                }
            )
    return {"valid": not issues, "issues": issues, "item_count": len(items)}


@app.get("/api/v1/trips/{trip_id}/price-summary")
def price_summary(trip_id: str, actor: Actor = Depends(get_actor), db: Session = Depends(get_db)):
    trip = get_trip(db, trip_id, actor)
    items = load_trip_items(db, trip_id)
    bookings = list(db.scalars(select(Booking).where(Booking.trip_id == trip_id)))
    estimated = sum((item.estimated_cost for item in items), Decimal("0"))
    confirmed = sum(
        (booking.confirmed_price for booking in bookings if booking.status == "CONFIRMED"),
        Decimal("0"),
    )
    budget = trip.budget_amount

    def money(value: Decimal | None) -> str | None:
        return None if value is None else f"{value:.2f}"

    return {
        "currency": trip.currency,
        "estimated_cost": money(estimated),
        "confirmed_price": money(confirmed),
        "additional_cost": money(Decimal("0")),
        "refund_amount": money(sum((booking.refund_amount for booking in bookings), Decimal("0"))),
        "budget_amount": money(budget),
        "budget_remaining": money(None if budget is None else budget - estimated),
    }


@app.post("/api/v1/trips/{trip_id}/bookings/mock", status_code=201)
def create_mock_bookings(
    trip_id: str, actor: Actor = Depends(get_actor), db: Session = Depends(get_db)
):
    trip = get_trip(db, trip_id, actor, write=True)
    items = load_trip_items(db, trip_id)
    created = []
    for item in items:
        if item.booked_status != "PLANNED":
            continue
        booking = Booking(
            trip_id=trip_id,
            itinerary_item_id=item.id,
            status="CONFIRMED",
            confirmed_price=item.estimated_cost,
            currency=trip.currency,
        )
        item.booked_status = "CONFIRMED"
        db.add(booking)
        db.flush()
        created.append(booking)
        audit(db, actor, "BOOKING_CONFIRMED", "booking", booking.id, trip_id)
    if created:
        trip.version += 1
        db.commit()
    return created


@app.get("/api/v1/trips/{trip_id}/bookings")
def list_bookings(trip_id: str, actor: Actor = Depends(get_actor), db: Session = Depends(get_db)):
    get_trip(db, trip_id, actor)
    return list(db.scalars(select(Booking).where(Booking.trip_id == trip_id)))


@app.post("/api/v1/bookings/{booking_id}/cancel")
def cancel_booking(
    booking_id: str, actor: Actor = Depends(get_actor), db: Session = Depends(get_db)
):
    booking = db.get(Booking, booking_id)
    if booking is None:
        raise fail("NOT_FOUND", "Booking not found", 404)
    trip = get_trip(db, booking.trip_id, actor, write=True)
    if booking.status != "CONFIRMED":
        raise fail("BOOKING_STATE_ERROR", "Only confirmed bookings can be cancelled", 409)
    booking.status = "CANCELLED"
    item = db.get(ItineraryItem, booking.itinerary_item_id)
    if item:
        item.booked_status = "CANCELLED"
    trip.version += 1
    audit(db, actor, "BOOKING_CANCELLED", "booking", booking.id, trip.id)
    db.commit()
    return booking


@app.post("/api/v1/trips/{trip_id}/disruptions", status_code=201)
def create_disruption(
    trip_id: str,
    data: DisruptionWrite,
    actor: Actor = Depends(get_actor),
    db: Session = Depends(get_db),
):
    require_operator(actor)
    trip = get_trip(db, trip_id, actor, write=True)
    item = db.get(ItineraryItem, data.affected_item_id)
    if item is None or item.trip_id != trip_id:
        raise fail("NOT_FOUND", "Affected itinerary item not found", 404)
    disruption = Disruption(trip_id=trip_id, **data.model_dump())
    db.add(disruption)
    db.flush()
    trip.version += 1
    audit(db, actor, "DISRUPTION_DETECTED", "disruption", disruption.id, trip_id)
    db.commit()
    db.refresh(disruption)
    return disruption


@app.post("/api/v1/disruptions/{disruption_id}/impact")
def impact(disruption_id: str, actor: Actor = Depends(get_actor), db: Session = Depends(get_db)):
    disruption = db.get(Disruption, disruption_id)
    if disruption is None:
        raise fail("NOT_FOUND", "Disruption not found", 404)
    trip = get_trip(db, disruption.trip_id, actor)
    items = load_trip_items(db, trip.id)
    dependencies = list(
        db.scalars(select(ItineraryDependency).where(ItineraryDependency.trip_id == trip.id))
    )
    result = analyze_impact(items, dependencies, disruption)
    audit(db, actor, "IMPACT_EVALUATED", "disruption", disruption.id, trip.id, result)
    db.commit()
    return result


@app.post("/api/v1/disruptions/{disruption_id}/recovery-options", response_model=list[RecoveryRead])
def recovery_options(
    disruption_id: str, actor: Actor = Depends(get_actor), db: Session = Depends(get_db)
):
    disruption = db.get(Disruption, disruption_id)
    if disruption is None:
        raise fail("NOT_FOUND", "Disruption not found", 404)
    trip = get_trip(db, disruption.trip_id, actor)
    items = load_trip_items(db, trip.id)
    dependencies = list(
        db.scalars(select(ItineraryDependency).where(ItineraryDependency.trip_id == trip.id))
    )
    impact_result = analyze_impact(items, dependencies, disruption)
    db.query(RecoveryOption).filter(
        RecoveryOption.disruption_id == disruption.id,
        RecoveryOption.status == "FEASIBLE",
    ).delete(synchronize_session=False)
    affected = [row for row in impact_result["items"] if row["status"] in {"AT_RISK", "BROKEN"}]
    options = []
    for row in affected:
        if disruption.disruption_type in {
            "FLIGHT_CANCELLED",
            "TRANSFER_UNAVAILABLE",
            "ACTIVITY_CANCELLED",
            "HOTEL_UNAVAILABLE",
        }:
            continue
        item = next(candidate for candidate in items if candidate.id == row["item_id"])
        if item.flexibility != "FLEXIBLE" or item.booked_status not in {"PLANNED", "PENDING"}:
            continue
        proposed_start = row["expected_start_time"]
        actions = build_reschedule_plan(items, dependencies, item.id, proposed_start)
        if not actions:
            continue
        candidate = RecoveryOption(
            trip_id=trip.id,
            disruption_id=disruption.id,
            title=f"Reschedule {item.title}",
            description="Move this flexible item after the delayed service.",
            additional_cost=Decimal("0"),
            score=Decimal("80"),
            status="FEASIBLE",
            action_type="RESCHEDULE_CASCADE",
            action_item_id=item.id,
            actions=actions,
            new_start_time=proposed_start,
            trip_version=trip.version,
        )
        db.add(candidate)
        options.append(candidate)
    audit(db, actor, "RECOVERY_OPTIONS_GENERATED", "disruption", disruption.id, trip.id)
    db.commit()
    for option in options:
        db.refresh(option)
    return options


@app.get("/api/v1/recovery-options/{option_id}", response_model=RecoveryRead)
def get_recovery(option_id: str, actor: Actor = Depends(get_actor), db: Session = Depends(get_db)):
    option = db.get(RecoveryOption, option_id)
    if option is None:
        raise fail("NOT_FOUND", "Recovery option not found", 404)
    get_trip(db, option.trip_id, actor)
    return option


@app.post("/api/v1/recovery-options/{option_id}/select")
def select_recovery(
    option_id: str,
    expected_trip_version: int,
    actor: Actor = Depends(get_actor),
    db: Session = Depends(get_db),
):
    option = db.scalar(
        select(RecoveryOption).where(RecoveryOption.id == option_id).with_for_update()
    )
    if option is None:
        raise fail("NOT_FOUND", "Recovery option not found", 404)
    trip = db.scalar(select(Trip).where(Trip.id == option.trip_id).with_for_update())
    if trip is None:
        raise fail("NOT_FOUND", "Trip not found", 404)
    trip = get_trip(db, option.trip_id, actor, write=True)
    if expected_trip_version != trip.version or option.trip_version != trip.version:
        raise fail("CONFLICT", "Trip changed after this recovery option was generated", 409)
    if option.status != "FEASIBLE":
        raise fail("CONFLICT", "Recovery option is no longer selectable", 409)
    item = db.get(ItineraryItem, option.action_item_id)
    if item is None or item.trip_id != trip.id or item.flexibility != "FLEXIBLE":
        raise fail("CONSTRAINT_VIOLATION", "Recovery target is no longer eligible", 409)
    if option.new_start_time is None:
        raise fail("CONSTRAINT_VIOLATION", "Recovery option has no proposed start time", 409)
    disruption = db.get(Disruption, option.disruption_id)
    if disruption is None:
        raise fail("CONSTRAINT_VIOLATION", "Recovery disruption no longer exists", 409)
    items = load_trip_items(db, trip.id)
    dependencies = list(
        db.scalars(select(ItineraryDependency).where(ItineraryDependency.trip_id == trip.id))
    )
    actions = build_reschedule_plan(items, dependencies, item.id, option.new_start_time)
    if not actions or actions != option.actions:
        raise fail(
            "CONSTRAINT_VIOLATION", "Recovery no longer satisfies itinerary constraints", 409
        )
    for action in actions:
        target = db.get(ItineraryItem, action["item_id"])
        if target is None:
            raise fail("CONSTRAINT_VIOLATION", "Recovery item no longer exists", 409)
        new_start = datetime.fromisoformat(action["start_time"])
        duration = target.end_time - target.start_time
        target.start_time = new_start
        target.end_time = new_start + duration
    trip.version += 1
    option.status = "APPLIED"
    audit(db, actor, "RECOVERY_APPROVED", "recovery_option", option.id, trip.id)
    audit(
        db,
        actor,
        "RECOVERY_APPLIED",
        "recovery_option",
        option.id,
        trip.id,
        {"actions": actions},
    )
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise fail("CONFLICT", "Recovery could not be applied", 409) from exc
    recipients = {trip.traveler_id}
    if trip.coordinator_id:
        recipients.add(trip.coordinator_id)
    for recipient in recipients:
        db.add(
            Notification(
                trip_id=trip.id,
                recipient_user_id=recipient,
                event_type="RECOVERY_APPLIED",
                message=f"Recovery was applied to {item.title}.",
            )
        )
    db.commit()
    return {"status": "APPLIED", "trip_version": trip.version, "item_id": item.id}


@app.get("/api/v1/operator/trips", response_model=list[TripRead])
def operator_trips(actor: Actor = Depends(get_actor), db: Session = Depends(get_db)):
    require_operator(actor)
    if actor.role == "admin":
        return list(db.scalars(select(Trip).order_by(Trip.created_at.desc())))
    return list(
        db.scalars(
            select(Trip)
            .where(Trip.coordinator_id == actor.user_id)
            .order_by(Trip.created_at.desc())
        )
    )


@app.get("/api/v1/operator/dashboard")
def operator_dashboard(actor: Actor = Depends(get_actor), db: Session = Depends(get_db)):
    require_operator(actor)
    trips = operator_trips(actor, db)
    return {
        "trip_count": len(trips),
        "active_trip_count": sum(trip.status == "ACTIVE" for trip in trips),
        "open_disruption_count": sum(
            1
            for row in db.scalars(select(Disruption))
            if row.status == "OPEN" and any(trip.id == row.trip_id for trip in trips)
        ),
    }


@app.post("/api/v1/trips/{trip_id}/coordinator")
def assign_coordinator(
    trip_id: str,
    coordinator_id: str,
    actor: Actor = Depends(get_actor),
    db: Session = Depends(get_db),
):
    if actor.role != "admin":
        raise fail("FORBIDDEN", "Administrator permission required", 403)
    require_operator(actor)
    trip = get_trip(db, trip_id, actor, write=True)
    trip.coordinator_id = coordinator_id
    trip.version += 1
    audit(db, actor, "COORDINATOR_ASSIGNED", "trip", trip.id, trip.id)
    db.commit()
    return {"trip_id": trip.id, "coordinator_id": trip.coordinator_id, "version": trip.version}


@app.post("/api/v1/trips/{trip_id}/itinerary/generate")
async def generate_itinerary(
    trip_id: str, actor: Actor = Depends(get_actor), db: Session = Depends(get_db)
):
    trip = get_trip(db, trip_id, actor)
    preferences = db.get(TripPreference, trip_id)
    try:
        draft = await ai_gateway.generate_itinerary(
            {
                "destination": trip.destination_summary,
                "start_date": trip.start_date.isoformat(),
                "end_date": trip.end_date.isoformat(),
                "currency": trip.currency,
                "preferences": {
                    "pace": preferences.pace,
                    "budget_tier": preferences.budget_tier,
                    "interests": preferences.interests,
                    "party_size": preferences.party_size,
                }
                if preferences
                else {},
            }
        )
    except AIProviderError as exc:
        raise ai_error(exc) from exc
    for item in draft.items:
        if item.start_time.utcoffset() is None or item.end_time.utcoffset() is None:
            raise fail("AI_PROVIDER_ERROR", "AI itinerary failed deterministic validation", 502)
        if (
            item.currency != trip.currency
            or item.end_time <= item.start_time
            or item.start_time < _utc(trip.start_date)
            or item.end_time > _utc(trip.end_date)
        ):
            raise fail("AI_PROVIDER_ERROR", "AI itinerary failed deterministic validation", 502)
    return {
        "items": [
            item.model_dump(mode="json") | {"estimated_cost": f"{item.estimated_cost:.2f}"}
            for item in draft.items
        ],
        "validated": True,
    }


@app.post("/api/v1/trips/{trip_id}/recommendations")
async def recommendations(
    trip_id: str, actor: Actor = Depends(get_actor), db: Session = Depends(get_db)
):
    trip = get_trip(db, trip_id, actor)
    preferences = db.get(TripPreference, trip_id)
    try:
        result = await ai_gateway.generate_recommendations(
            {
                "destination": trip.destination_summary,
                "currency": trip.currency,
                "preferences": preferences.interests if preferences else [],
            }
        )
    except AIProviderError as exc:
        raise ai_error(exc) from exc
    return result.model_dump()


@app.post("/api/v1/trips/{trip_id}/assistant")
async def assistant(
    trip_id: str,
    body: AssistantQuestion,
    actor: Actor = Depends(get_actor),
    db: Session = Depends(get_db),
):
    trip = get_trip(db, trip_id, actor)
    try:
        result = await ai_gateway.answer_trip_question(
            {"destination": trip.destination_summary, "question": body.question.strip()}
        )
    except AIProviderError as exc:
        raise ai_error(exc) from exc
    return result.model_dump()
