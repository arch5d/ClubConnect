"""FastAPI entry point for DAA-T160 backend."""

from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.models.schemas import Event, RecommendationResult, SearchQuery, StudentProfile
from app.services.student_service import StudentService

app = FastAPI(title="DAA-T160: College Events Recommendation API", version="0.1.0")
student_service = StudentService()
EVENT_STORE: list[Event] = []

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    """Simple health check endpoint."""
    return {"status": "ok"}


@app.post("/students/profile", response_model=StudentProfile)
def create_student_profile(profile: StudentProfile) -> StudentProfile:
    """Create or update student profile."""
    return student_service.create_profile(profile)


@app.post("/events", response_model=Event)
def create_event(event: Event) -> Event:
    """Register an event for browsing/recommendation demos."""
    EVENT_STORE.append(event)
    return event


@app.get("/events", response_model=list[Event])
def list_events() -> list[Event]:
    """Return all registered events."""
    return EVENT_STORE


@app.get("/search", response_model=list[Event])
def search_events(q: str) -> list[Event]:
    """Search events using KMP matching over title and description."""
    return student_service.browse_events(
        events=EVENT_STORE,
        query=q,
        algorithm="kmp",
        limit=None,
    )


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
