"""FastAPI entry point for DAA-T160 backend."""

from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.models.schemas import Club, Event, RecommendationResult, SearchQuery, StudentProfile
from app.services.persistence import (
    load_clubs,
    load_events,
    load_students,
    save_clubs,
    save_events,
    save_students,
)
from app.services.student_service import StudentService

app = FastAPI(title="DAA-T160: College Events Recommendation API", version="0.2.0")

# ── Persistent state loaded at startup ────────────────────────────────────────
student_service = StudentService()
student_service.profiles = load_students()
EVENT_STORE: list[Event] = load_events()
CLUB_STORE: dict[str, Club] = load_clubs()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


# ── Students ──────────────────────────────────────────────────────────────────

@app.post("/students/profile", response_model=StudentProfile)
def create_student_profile(profile: StudentProfile) -> StudentProfile:
    """Create or update student profile (persisted to disk)."""
    result = student_service.create_profile(profile)
    save_students(student_service.profiles)
    return result


@app.get("/students/{student_id}", response_model=StudentProfile)
def get_student_profile(student_id: str) -> StudentProfile:
    """Fetch a student profile by ID."""
    profile = student_service.profiles.get(student_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="student profile not found")
    return profile


# ── Clubs ─────────────────────────────────────────────────────────────────────

@app.post("/clubs", response_model=Club)
def create_club(club: Club) -> Club:
    """Register a new club (persisted to disk)."""
    CLUB_STORE[club.club_id] = club
    save_clubs(CLUB_STORE)
    return club


@app.get("/clubs", response_model=list[Club])
def list_clubs() -> list[Club]:
    """Return all registered clubs."""
    return list(CLUB_STORE.values())


@app.get("/clubs/{club_id}", response_model=Club)
def get_club(club_id: str) -> Club:
    club = CLUB_STORE.get(club_id)
    if club is None:
        raise HTTPException(status_code=404, detail="club not found")
    return club


@app.get("/clubs/{club_id}/events", response_model=list[Event])
def list_club_events(club_id: str) -> list[Event]:
    """Return all events belonging to a specific club."""
    if club_id not in CLUB_STORE:
        raise HTTPException(status_code=404, detail="club not found")
    return [e for e in EVENT_STORE if e.club_id == club_id]


# ── Events ────────────────────────────────────────────────────────────────────

@app.post("/events", response_model=Event)
def create_event(event: Event) -> Event:
    """Register an event (persisted to disk)."""
    EVENT_STORE.append(event)
    save_events(EVENT_STORE)
    return event


@app.get("/events", response_model=list[Event])
def list_events() -> list[Event]:
    return EVENT_STORE


@app.get("/search", response_model=list[Event])
def search_events(q: str) -> list[Event]:
    """Search events using KMP matching over title and description."""
    return student_service.browse_events(events=EVENT_STORE, query=q, algorithm="kmp")


@app.post("/events/search", response_model=list[Event])
def search_events_advanced(payload: SearchQuery) -> list[Event]:
    """Backward-compatible endpoint for explicit algorithm selection."""
    if payload.algorithm.lower() not in {"kmp", "rabin_karp"}:
        raise HTTPException(status_code=400, detail="algorithm must be kmp or rabin_karp")
    return student_service.browse_events(
        events=EVENT_STORE,
        query=payload.query,
        algorithm=payload.algorithm,
        limit=payload.limit,
    )


# ── Recommendations ───────────────────────────────────────────────────────────

@app.get("/recommendations/{user_id}", response_model=list[RecommendationResult])
def recommend_events(user_id: str) -> list[RecommendationResult]:
    """Return Top-5 recommendations using heap-based Top-K matching."""
    profile = student_service.profiles.get(user_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="student profile not found")
    ranked = student_service.recommend(profile, EVENT_STORE, top_k=5)
    return [RecommendationResult(event=event, score=score) for score, event in ranked]


@app.get("/students/{student_id}/recommendations", response_model=list[RecommendationResult])
def recommend_events_compat(student_id: str, top_k: int = 5) -> list[RecommendationResult]:
    """Backward-compatible recommendations endpoint."""
    profile = student_service.profiles.get(student_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="student profile not found")
    ranked = student_service.recommend(profile, EVENT_STORE, top_k=top_k)
    return [RecommendationResult(event=event, score=score) for score, event in ranked]
