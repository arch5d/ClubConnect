"""Pydantic schemas for requests and responses."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.enums import CapacityBand, Goal, Scope, Skill


class StudentProfile(BaseModel):
    student_id: str
    full_name: str
    college: str
    contact: str
    password: str = Field(default="")
    skills: list[Skill] = Field(default_factory=list)
    interests: list[str] = Field(default_factory=list)
    goals: list[Goal] = Field(default_factory=list)
    available_slots: list[str] = Field(default_factory=list)
    bio: str = Field(default="")
    year: str = Field(default="")
    department: str = Field(default="")
    avatar_initials: str = Field(default="")
    registered_events: list[str] = Field(default_factory=list)


class Moderator(BaseModel):
    moderator_id: str
    full_name: str
    email: str
    password: str
    college: str
    department: str = Field(default="")
    bio: str = Field(default="")


class Club(BaseModel):
    club_id: str
    name: str
    description: str
    category: str = Field(default="General")
    moderator_id: str = Field(default="")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Event(BaseModel):
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
    club_id: Optional[str] = Field(default=None)
    moderator_id: str = Field(default="")
    venue: str = Field(default="")
    prize: str = Field(default="")


class LoginRequest(BaseModel):
    email: str
    password: str
    role: str  # "student" | "moderator"


class LoginResponse(BaseModel):
    success: bool
    role: str
    user_id: str
    full_name: str
    message: str = ""


class RecommendationResult(BaseModel):
    event: Event
    score: float


class SearchQuery(BaseModel):
    query: str
    algorithm: str = Field(default="kmp", description="kmp or rabin_karp")
    limit: Optional[int] = Field(default=None, ge=1)


class RegisterEventRequest(BaseModel):
    student_id: str
    event_id: str
