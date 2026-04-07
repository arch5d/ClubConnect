"""Pydantic schemas for requests and responses."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.enums import CapacityBand, Goal, Scope, Skill


class StudentProfile(BaseModel):
    """Student profile used for matching and search personalization."""

    student_id: str
    full_name: str
    college: str
    contact: str
    skills: list[Skill] = Field(default_factory=list)
    interests: list[str] = Field(default_factory=list)
    goals: list[Goal] = Field(default_factory=list)
    available_slots: list[str] = Field(default_factory=list)


class Event(BaseModel):
    """Event definition captured by moderators."""

    event_id: str
    title: str
    description: str
    skills_required: list[Skill] = Field(default_factory=list)
    goal_tags: list[Goal] = Field(default_factory=list)
    scope: Scope
    capacity_band: CapacityBand
    capacity_limit: int = Field(ge=1)
    registered_count: int = Field(default=0, ge=0)
    registration_open_till: datetime
    time_slot: str


class RecommendationResult(BaseModel):
    """Output payload for recommendation candidates."""

    event: Event
    score: float


class SearchQuery(BaseModel):
    """Request model for event search."""

    query: str
    algorithm: str = Field(default="kmp", description="kmp or rabin_karp")
    limit: Optional[int] = Field(default=None, ge=1)
