from datetime import UTC, datetime
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


def _id() -> str:
    return str(uuid4())


def _now() -> datetime:
    return datetime.now(UTC)


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_id)
    traveler_id: Mapped[str] = mapped_column(String(128), index=True)
    coordinator_id: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    destination_summary: Mapped[str] = mapped_column(String(500), default="")
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(String(32), default="PLANNING")
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    budget_amount: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    version: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, onupdate=_now
    )


class TripPreference(Base):
    __tablename__ = "trip_preferences"

    trip_id: Mapped[str] = mapped_column(
        ForeignKey("trips.id", ondelete="CASCADE"), primary_key=True
    )
    pace: Mapped[str | None] = mapped_column(String(40), nullable=True)
    budget_tier: Mapped[str | None] = mapped_column(String(40), nullable=True)
    accommodation_type: Mapped[str | None] = mapped_column(String(80), nullable=True)
    transportation_style: Mapped[str | None] = mapped_column(String(80), nullable=True)
    interests: Mapped[list[str]] = mapped_column(JSON, default=list)
    travel_style: Mapped[str | None] = mapped_column(String(80), nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    party_size: Mapped[int] = mapped_column(Integer, default=1)


class ItineraryItem(Base):
    __tablename__ = "itinerary_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_id)
    trip_id: Mapped[str] = mapped_column(ForeignKey("trips.id", ondelete="CASCADE"), index=True)
    item_type: Mapped[str] = mapped_column(String(32))
    title: Mapped[str] = mapped_column(String(200))
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    timezone: Mapped[str] = mapped_column(String(64), default="UTC")
    location_text: Mapped[str] = mapped_column(String(300), default="")
    latitude: Mapped[float | None] = mapped_column(nullable=True)
    longitude: Mapped[float | None] = mapped_column(nullable=True)
    estimated_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0"))
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    booked_status: Mapped[str] = mapped_column(String(32), default="PLANNED")
    status: Mapped[str] = mapped_column(String(32), default="ACTIVE")
    flexibility: Mapped[str] = mapped_column(String(24), default="FLEXIBLE")
    required_buffer_minutes: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, onupdate=_now
    )


class ItineraryDependency(Base):
    __tablename__ = "itinerary_dependencies"
    __table_args__ = (
        UniqueConstraint("upstream_item_id", "downstream_item_id", name="uq_itinerary_dependency"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_id)
    trip_id: Mapped[str] = mapped_column(ForeignKey("trips.id", ondelete="CASCADE"), index=True)
    upstream_item_id: Mapped[str] = mapped_column(
        ForeignKey("itinerary_items.id", ondelete="CASCADE")
    )
    downstream_item_id: Mapped[str] = mapped_column(
        ForeignKey("itinerary_items.id", ondelete="CASCADE")
    )
    dependency_type: Mapped[str] = mapped_column(String(32), default="SEQUENTIAL")
    min_required_buffer_minutes: Mapped[int] = mapped_column(Integer, default=0)


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_id)
    trip_id: Mapped[str] = mapped_column(ForeignKey("trips.id", ondelete="CASCADE"), index=True)
    itinerary_item_id: Mapped[str] = mapped_column(
        ForeignKey("itinerary_items.id", ondelete="CASCADE")
    )
    status: Mapped[str] = mapped_column(String(32), default="PENDING")
    confirmed_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(3))
    refund_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, onupdate=_now
    )


class Disruption(Base):
    __tablename__ = "disruptions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_id)
    trip_id: Mapped[str] = mapped_column(ForeignKey("trips.id", ondelete="CASCADE"), index=True)
    affected_item_id: Mapped[str] = mapped_column(
        ForeignKey("itinerary_items.id", ondelete="CASCADE")
    )
    disruption_type: Mapped[str] = mapped_column(String(40))
    severity: Mapped[str] = mapped_column(String(24))
    details: Mapped[str] = mapped_column(Text, default="")
    delay_minutes: Mapped[int] = mapped_column(Integer, default=0)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    status: Mapped[str] = mapped_column(String(24), default="OPEN")


class RecoveryOption(Base):
    __tablename__ = "recovery_options"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_id)
    trip_id: Mapped[str] = mapped_column(ForeignKey("trips.id", ondelete="CASCADE"), index=True)
    disruption_id: Mapped[str] = mapped_column(ForeignKey("disruptions.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    additional_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0"))
    score: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("0"))
    status: Mapped[str] = mapped_column(String(24), default="FEASIBLE")
    action_type: Mapped[str] = mapped_column(String(32))
    action_item_id: Mapped[str] = mapped_column(String(36))
    actions: Mapped[list[dict]] = mapped_column(JSON, default=list)
    new_start_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    trip_version: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_id)
    actor_user_id: Mapped[str] = mapped_column(String(128), index=True)
    trip_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    entity_type: Mapped[str] = mapped_column(String(64))
    entity_id: Mapped[str] = mapped_column(String(36))
    event_type: Mapped[str] = mapped_column(String(64), index=True)
    payload: Mapped[str] = mapped_column(Text, default="{}")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_id)
    trip_id: Mapped[str] = mapped_column(ForeignKey("trips.id", ondelete="CASCADE"), index=True)
    recipient_user_id: Mapped[str] = mapped_column(String(128), index=True)
    event_type: Mapped[str] = mapped_column(String(64))
    message: Mapped[str] = mapped_column(String(500))
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
