import json
from datetime import datetime
from decimal import Decimal
from typing import Any

import httpx
from pydantic import BaseModel, Field, ValidationError

from app.core.config import get_settings


class AIProviderError(Exception):
    pass


class ItineraryDraftItem(BaseModel):
    item_type: str
    title: str
    start_time: datetime
    end_time: datetime
    timezone: str
    location_text: str
    estimated_cost: Decimal = Field(ge=0, max_digits=12, decimal_places=2)
    currency: str = Field(pattern=r"^[A-Z]{3}$")
    reason: str


class ItineraryDraft(BaseModel):
    items: list[ItineraryDraftItem]


class PreferenceInterpretation(BaseModel):
    pace: str
    budget_tier: str
    interests: list[str]
    travel_style: str


class Recommendation(BaseModel):
    title: str
    item_type: str
    reason: str


class Recommendations(BaseModel):
    recommendations: list[Recommendation]


class AssistantAnswer(BaseModel):
    answer: str


class RankedRecoveryOptions(BaseModel):
    ranked_option_ids: list[str]
    explanations: dict[str, str]


class AIGateway:
    def __init__(self) -> None:
        self.settings = get_settings()

    async def _complete(self, operation: str, context: dict[str, Any], schema: type[BaseModel]):
        if not (self.settings.ai_api_key and self.settings.ai_base_url and self.settings.ai_model):
            raise AIProviderError("AI provider is not configured")
        body = {
            "model": self.settings.ai_model,
            "temperature": 0.2,
            "response_format": {"type": "json_object"},
            "messages": [
                {
                    "role": "system",
                    "content": (
                        f"Perform {operation}. Return only JSON matching this schema: "
                        f"{json.dumps(schema.model_json_schema())}"
                    ),
                },
                {"role": "user", "content": json.dumps(context, separators=(",", ":"))},
            ],
        }
        try:
            async with httpx.AsyncClient(timeout=self.settings.ai_timeout_seconds) as client:
                response = await client.post(
                    f"{self.settings.ai_base_url.rstrip('/')}/chat/completions",
                    headers={"Authorization": f"Bearer {self.settings.ai_api_key}"},
                    json=body,
                )
                response.raise_for_status()
                content = response.json()["choices"][0]["message"]["content"]
                return schema.model_validate_json(content)
        except (httpx.HTTPError, KeyError, IndexError, ValueError, ValidationError) as exc:
            raise AIProviderError("AI provider request or response validation failed") from exc

    async def generate_itinerary(self, context: dict[str, Any]) -> ItineraryDraft:
        return await self._complete("generate a travel itinerary draft", context, ItineraryDraft)

    async def generate_recommendations(self, context: dict[str, Any]) -> Recommendations:
        return await self._complete("generate travel recommendations", context, Recommendations)

    async def rank_recovery_options(self, context: dict[str, Any]) -> RankedRecoveryOptions:
        return await self._complete(
            "rank feasible recovery options", context, RankedRecoveryOptions
        )

    async def answer_trip_question(self, context: dict[str, Any]) -> AssistantAnswer:
        return await self._complete("answer a traveler's trip question", context, AssistantAnswer)

    async def interpret_preferences(self, context: dict[str, Any]) -> PreferenceInterpretation:
        return await self._complete(
            "interpret travel preferences", context, PreferenceInterpretation
        )


ai_gateway = AIGateway()
