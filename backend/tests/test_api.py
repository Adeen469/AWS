from datetime import UTC, datetime, timedelta

from app.core.security import Actor, get_actor
from app.db import Base, get_db
from app.main import app
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

test_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSession = sessionmaker(bind=test_engine, autoflush=False, expire_on_commit=False)
current_actor = Actor(user_id="traveler-a", role="traveler")


def override_db():
    with TestSession() as session:
        yield session


def traveler():
    return current_actor


def setup_function():
    global current_actor
    current_actor = Actor(user_id="traveler-a", role="traveler")
    Base.metadata.drop_all(test_engine)
    Base.metadata.create_all(test_engine)


app.dependency_overrides[get_db] = override_db
app.dependency_overrides[get_actor] = traveler
client = TestClient(app)


def test_trip_owner_checks_and_price_uses_server_calculation():
    start = datetime.now(UTC) + timedelta(days=10)
    response = client.post(
        "/api/v1/trips",
        json={
            "title": "Paris",
            "destination_summary": "Paris, France",
            "start_date": start.isoformat(),
            "end_date": (start + timedelta(days=4)).isoformat(),
            "currency": "EUR",
            "budget_amount": "100.00",
        },
    )
    assert response.status_code == 201
    trip_id = response.json()["id"]

    item_response = client.post(
        f"/api/v1/trips/{trip_id}/itinerary/items",
        json={
            "item_type": "ACTIVITY",
            "title": "Museum",
            "start_time": (start + timedelta(hours=1)).isoformat(),
            "end_time": (start + timedelta(hours=2)).isoformat(),
            "estimated_cost": "20.50",
            "currency": "EUR",
        },
    )
    assert item_response.status_code == 201
    assert item_response.json()["estimated_cost"] == "20.50"
    summary = client.get(f"/api/v1/trips/{trip_id}/price-summary")
    assert summary.status_code == 200
    assert summary.json()["estimated_cost"] == "20.50"
    assert summary.json()["budget_remaining"] == "79.50"


def test_unconfigured_ai_provider_returns_explicit_error():
    start = datetime.now(UTC) + timedelta(days=10)
    trip = client.post(
        "/api/v1/trips",
        json={
            "title": "Trip",
            "start_date": start.isoformat(),
            "end_date": (start + timedelta(days=1)).isoformat(),
        },
    ).json()

    response = client.post(f"/api/v1/trips/{trip['id']}/itinerary/generate")

    assert response.status_code == 503
    assert response.json()["error"]["code"] == "AI_PROVIDER_ERROR"
    assert response.headers["X-Request-ID"]


def test_traveler_cannot_read_another_travelers_trip():
    global current_actor
    start = datetime.now(UTC) + timedelta(days=10)
    trip = client.post(
        "/api/v1/trips",
        json={
            "title": "Private trip",
            "start_date": start.isoformat(),
            "end_date": (start + timedelta(days=1)).isoformat(),
        },
    ).json()
    current_actor = Actor(user_id="traveler-b", role="traveler")
    response = client.get(f"/api/v1/trips/{trip['id']}")
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "FORBIDDEN"


def test_preferences_round_trip_as_structured_interests():
    start = datetime.now(UTC) + timedelta(days=10)
    trip = client.post(
        "/api/v1/trips",
        json={
            "title": "Preferences trip",
            "start_date": start.isoformat(),
            "end_date": (start + timedelta(days=1)).isoformat(),
        },
    ).json()

    response = client.put(
        f"/api/v1/trips/{trip['id']}/preferences",
        json={"interests": ["museums", "food"], "party_size": 2},
    )

    assert response.status_code == 200
    assert response.json()["interests"] == ["museums", "food"]
    assert response.json()["party_size"] == 2


def test_validation_errors_use_safe_error_envelope():
    response = client.post(
        "/api/v1/trips",
        json={"title": "secret-title", "start_date": "not-a-date"},
    )

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"
    assert response.json()["error"]["request_id"]
    assert "secret-title" not in response.text


def test_recovery_applies_all_cascade_actions_after_version_check():
    global current_actor
    current_actor = Actor(user_id="operator-admin", role="admin")
    start = datetime.now(UTC) + timedelta(days=10)
    trip = client.post(
        "/api/v1/trips",
        json={
            "title": "Recovery trip",
            "start_date": start.isoformat(),
            "end_date": (start + timedelta(days=1)).isoformat(),
        },
    ).json()
    flight = client.post(
        f"/api/v1/trips/{trip['id']}/itinerary/items",
        json={
            "item_type": "FLIGHT",
            "title": "Arrival flight",
            "start_time": (start + timedelta(hours=1)).isoformat(),
            "end_time": (start + timedelta(hours=2)).isoformat(),
            "flexibility": "FIXED",
        },
    ).json()
    transfer = client.post(
        f"/api/v1/trips/{trip['id']}/itinerary/items",
        json={
            "item_type": "TRANSFER",
            "title": "Airport transfer",
            "start_time": (start + timedelta(hours=2, minutes=30)).isoformat(),
            "end_time": (start + timedelta(hours=3, minutes=30)).isoformat(),
            "depends_on": [flight["id"]],
        },
    ).json()
    dinner = client.post(
        f"/api/v1/trips/{trip['id']}/itinerary/items",
        json={
            "item_type": "ACTIVITY",
            "title": "Dinner",
            "start_time": (start + timedelta(hours=4)).isoformat(),
            "end_time": (start + timedelta(hours=5)).isoformat(),
            "depends_on": [transfer["id"]],
        },
    ).json()
    disruption = client.post(
        f"/api/v1/trips/{trip['id']}/disruptions",
        json={
            "affected_item_id": flight["id"],
            "disruption_type": "FLIGHT_DELAY",
            "severity": "HIGH",
            "delay_minutes": 180,
        },
    ).json()
    options = client.post(f"/api/v1/disruptions/{disruption['id']}/recovery-options")

    assert options.status_code == 200
    option = next(
        candidate for candidate in options.json() if candidate["action_item_id"] == transfer["id"]
    )
    assert len(option["actions"]) == 2
    response = client.post(
        f"/api/v1/recovery-options/{option['id']}/select",
        params={"expected_trip_version": option["trip_version"]},
    )

    assert response.status_code == 200
    updated_items = {
        item["id"]: item for item in client.get(f"/api/v1/trips/{trip['id']}/itinerary").json()
    }
    assert updated_items[transfer["id"]]["start_time"] == option["actions"][0]["start_time"]
    assert updated_items[dinner["id"]]["start_time"] == option["actions"][1]["start_time"]
