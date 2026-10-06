from datetime import UTC, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


def _require_aware(value: datetime) -> datetime:
    if value.utcoffset() is None:
        raise ValueError("datetime must include a timezone")
    return value.astimezone(UTC)


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class TripCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    destination_summary: str = Field(default="", max_length=500)
    start_date: datetime
    end_date: datetime
    currency: str = Field(default="USD", pattern=r"^[A-Z]{3}$")
    budget_amount: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)

    @field_validator("start_date", "end_date")
    @classmethod
    def dates_have_timezone(cls, value: datetime) -> datetime:
        return _require_aware(value)

    @model_validator(mode="after")
    def dates_are_ordered(self):
        if self.end_date <= self.start_date:
            raise ValueError("end_date must be after start_date")
        return self


class TripPatch(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    destination_summary: str | None = Field(default=None, max_length=500)
    start_date: datetime | None = None
    end_date: datetime | None = None
    status: Literal["PLANNING", "ACTIVE", "COMPLETED", "CANCELLED"] | None = None
    currency: str | None = Field(default=None, pattern=r"^[A-Z]{3}$")
    budget_amount: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)

    @field_validator("start_date", "end_date")
    @classmethod
    def dates_have_timezone(cls, value: datetime | None) -> datetime | None:
        return None if value is None else _require_aware(value)


class TripRead(ORMModel):
    id: str
    traveler_id: str
    coordinator_id: str | None
    title: str
    destination_summary: str
    start_date: datetime
    end_date: datetime
    status: str
    currency: str
    budget_amount: Decimal | None
    version: int
    created_at: datetime
    updated_at: datetime


class PreferencesWrite(BaseModel):
    pace: str | None = Field(default=None, max_length=40)
    budget_tier: str | None = Field(default=None, max_length=40)
    accommodation_type: str | None = Field(default=None, max_length=80)
    transportation_style: str | None = Field(default=None, max_length=80)
    interests: list[str] = Field(default_factory=list, max_length=30)
    travel_style: str | None = Field(default=None, max_length=80)
    notes: str = Field(default="", max_length=2000)
    party_size: int = Field(default=1, ge=1, le=30)


class PreferencesRead(ORMModel):
    trip_id: str
    pace: str | None
    budget_tier: str | None
    accommodation_type: str | None
    transportation_style: str | None
    interests: list[str]
    travel_style: str | None
    notes: str
    party_size: int


class ItemWrite(BaseModel):
    item_type: str = Field(min_length=1, max_length=32)
    title: str = Field(min_length=1, max_length=200)
    start_time: datetime
    end_time: datetime
    timezone: str = Field(default="UTC", max_length=64)
    location_text: str = Field(default="", max_length=300)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    estimated_cost: Decimal = Field(default=Decimal("0"), ge=0, max_digits=12, decimal_places=2)
    currency: str = Field(default="USD", pattern=r"^[A-Z]{3}$")
    flexibility: Literal["FLEXIBLE", "FIXED"] = "FLEXIBLE"
    required_buffer_minutes: int = Field(default=0, ge=0, le=1440)
    depends_on: list[str] = Field(default_factory=list, max_length=100)

    @field_validator("start_time", "end_time")
    @classmethod
    def times_have_timezone(cls, value: datetime) -> datetime:
        return _require_aware(value)

    @model_validator(mode="after")
    def validate_interval(self):
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        return self


class ItemPatch(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    start_time: datetime | None = None
    end_time: datetime | None = None
    location_text: str | None = Field(default=None, max_length=300)
    estimated_cost: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    flexibility: Literal["FLEXIBLE", "FIXED"] | None = None

    @field_validator("start_time", "end_time")
    @classmethod
    def times_have_timezone(cls, value: datetime | None) -> datetime | None:
        return None if value is None else _require_aware(value)


class ItemRead(ORMModel):
    id: str
    trip_id: str
    item_type: str
    title: str
    start_time: datetime
    end_time: datetime
    timezone: str
    location_text: str
    estimated_cost: Decimal
    currency: str
    booked_status: str
    status: str
    flexibility: str
    required_buffer_minutes: int


class DisruptionWrite(BaseModel):
    affected_item_id: str
    disruption_type: Literal[
        "FLIGHT_DELAY",
        "FLIGHT_CANCELLED",
        "TRAIN_DELAY",
        "TRANSFER_UNAVAILABLE",
        "ACTIVITY_CANCELLED",
        "HOTEL_UNAVAILABLE",
    ]
    severity: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    details: str = Field(default="", max_length=2000)
    delay_minutes: int = Field(default=0, ge=0, le=10080)


class AssistantQuestion(BaseModel):
    question: str = Field(min_length=1, max_length=2000)


class RecoveryRead(ORMModel):
    id: str
    trip_id: str
    disruption_id: str
    title: str
    description: str
    additional_cost: Decimal
    score: Decimal
    status: str
    action_type: str
    action_item_id: str
    actions: list[dict]
    new_start_time: datetime | None
    trip_version: int
