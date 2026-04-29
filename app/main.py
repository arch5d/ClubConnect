"""FastAPI entry point — ClubConnect DAA-T160."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.models.schemas import (
    Club,
    Event,
    LoginRequest,
    LoginResponse,
    Moderator,
    RecommendationResult,
    RegisterEventRequest,
    SearchQuery,
    StudentProfile,
)
from app.services.persistence import (
    load_clubs,
    load_events,
    load_moderators,
    load_students,
    save_clubs,
    save_events,
    save_moderators,
    save_students,
)
from app.services.student_service import StudentService

app = FastAPI(title="ClubConnect API", version="1.0.0")

# ── Load persistent state ─────────────────────────────────────────────────────
student_service = StudentService()
student_service.profiles = load_students()
EVENT_STORE: list[Event] = load_events()
CLUB_STORE: dict[str, Club] = load_clubs()
MODERATOR_STORE: dict[str, Moderator] = load_moderators()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Demo seed (runs once if data is empty) ────────────────────────────────────
def _seed_demo_data() -> None:
    """Populate demo moderators, students, clubs, and events on first run."""

    # ── Moderators ────────────────────────────────────────────────────────────
    if not MODERATOR_STORE:
        demo_mods = [
            Moderator(
                moderator_id="mod-001",
                full_name="Dr. Priya Sharma",
                email="priya@college.edu",
                password="mod123",
                college="Tech Valley Institute",
                department="Computer Science",
                bio="Faculty coordinator for technical clubs and hackathons.",
            ),
            Moderator(
                moderator_id="mod-002",
                full_name="Prof. Arjun Nair",
                email="arjun@college.edu",
                password="mod456",
                college="Tech Valley Institute",
                department="Electronics",
                bio="Organiser of cultural and inter-college events.",
            ),
        ]
        for m in demo_mods:
            MODERATOR_STORE[m.moderator_id] = m
        save_moderators(MODERATOR_STORE)

    # ── Students ──────────────────────────────────────────────────────────────
    if not student_service.profiles:
        demo_students = [
            StudentProfile(
                student_id="student-001",
                full_name="Aarav Mehta",
                college="Tech Valley Institute",
                contact="aarav@student.edu",
                password="pass123",
                skills=["python", "data_analysis", "machine_learning"],
                interests=["hackathons", "ai", "open source"],
                goals=["learn", "build"],
                available_slots=["sat-10:00", "sun-14:00", "fri-18:00"],
                bio="Passionate about algorithms and building impactful tech.",
                year="3rd Year",
                department="Computer Science",
                avatar_initials="AM",
            ),
            StudentProfile(
                student_id="student-002",
                full_name="Sneha Patel",
                college="Tech Valley Institute",
                contact="sneha@student.edu",
                password="pass456",
                skills=["javascript", "ui_ux", "public_speaking"],
                interests=["design", "web dev", "debate"],
                goals=["network", "build"],
                available_slots=["mon-09:00", "wed-14:00", "sat-10:00"],
                bio="UI/UX enthusiast who loves building beautiful products.",
                year="2nd Year",
                department="Information Technology",
                avatar_initials="SP",
            ),
            StudentProfile(
                student_id="student-003",
                full_name="Rohan Verma",
                college="Tech Valley Institute",
                contact="rohan@student.edu",
                password="pass789",
                skills=["cloud", "python", "data_analysis"],
                interests=["cloud computing", "startups", "finance"],
                goals=["compete", "network"],
                available_slots=["tue-09:00", "thu-14:00", "sun-14:00"],
                bio="Cloud enthusiast and competitive programmer.",
                year="4th Year",
                department="Computer Science",
                avatar_initials="RV",
            ),
        ]
        for s in demo_students:
            student_service.profiles[s.student_id] = s
        save_students(student_service.profiles)

    # ── Clubs ─────────────────────────────────────────────────────────────────
    if not CLUB_STORE:
        demo_clubs = [
            Club(
                club_id="club-001",
                name="CodeCraft Club",
                description="A hub for competitive programmers, hackathon enthusiasts, and open-source contributors.",
                category="Technical",
                moderator_id="mod-001",
                created_at=datetime(2025, 1, 10, tzinfo=timezone.utc),
            ),
            Club(
                club_id="club-002",
                name="Design & Innovation Lab",
                description="Exploring UI/UX, product design, and creative problem solving.",
                category="Technical",
                moderator_id="mod-001",
                created_at=datetime(2025, 2, 5, tzinfo=timezone.utc),
            ),
            Club(
                club_id="club-003",
                name="Cloud & DevOps Society",
                description="Hands-on workshops on AWS, GCP, Docker, Kubernetes and modern DevOps practices.",
                category="Technical",
                moderator_id="mod-002",
                created_at=datetime(2025, 1, 20, tzinfo=timezone.utc),
            ),
            Club(
                club_id="club-004",
                name="Oratory & Debate Club",
                description="Sharpening public speaking, debate, and leadership skills through competitions.",
                category="Literary",
                moderator_id="mod-002",
                created_at=datetime(2025, 3, 1, tzinfo=timezone.utc),
            ),
        ]
        for c in demo_clubs:
            CLUB_STORE[c.club_id] = c
        save_clubs(CLUB_STORE)

    # ── Events ────────────────────────────────────────────────────────────────
    if not EVENT_STORE:
        demo_events = [
            Event(
                event_id="evt-001",
                title="National Hackathon 2025",
                description="36-hour hackathon open to all students. Build innovative solutions for real-world problems. Cash prizes worth ₹1,00,000.",
                skills_required=["python", "javascript", "machine_learning"],
                goal_tags=["build", "compete"],
                scope="inter_college",
                capacity_band="large",
                capacity_limit=200,
                registered_count=47,
                registration_open_till=datetime(2025, 12, 1, tzinfo=timezone.utc),
                time_slot="sat-10:00",
                club_id="club-001",
                moderator_id="mod-001",
                venue="Main Auditorium",
                prize="₹1,00,000 cash + internship offers",
            ),
            Event(
                event_id="evt-002",
                title="Python for Data Science Workshop",
                description="Hands-on workshop covering pandas, numpy, matplotlib and scikit-learn. Beginner friendly — no prior ML experience needed.",
                skills_required=["python", "data_analysis"],
                goal_tags=["learn"],
                scope="intra_college",
                capacity_band="medium",
                capacity_limit=60,
                registered_count=23,
                registration_open_till=datetime(2025, 11, 15, tzinfo=timezone.utc),
                time_slot="sun-14:00",
                club_id="club-001",
                moderator_id="mod-001",
                venue="Lab Block 3, Room 301",
                prize="Certificate of Participation",
            ),
            Event(
                event_id="evt-003",
                title="UI/UX Design Sprint",
                description="A 2-day design challenge where teams prototype solutions for social impact. Figma skills preferred but not required.",
                skills_required=["ui_ux", "javascript"],
                goal_tags=["build", "learn"],
                scope="intra_college",
                capacity_band="small",
                capacity_limit=30,
                registered_count=18,
                registration_open_till=datetime(2025, 11, 20, tzinfo=timezone.utc),
                time_slot="sat-10:00",
                club_id="club-002",
                moderator_id="mod-001",
                venue="Design Studio, Block A",
                prize="Best Design Award + Goodies",
            ),
            Event(
                event_id="evt-004",
                title="AWS Cloud Practitioner Bootcamp",
                description="Intensive 1-day bootcamp covering AWS core services, IAM, EC2, S3, and Lambda. Exam vouchers for top performers.",
                skills_required=["cloud"],
                goal_tags=["learn", "network"],
                scope="inter_college",
                capacity_band="medium",
                capacity_limit=80,
                registered_count=55,
                registration_open_till=datetime(2025, 11, 25, tzinfo=timezone.utc),
                time_slot="sun-14:00",
                club_id="club-003",
                moderator_id="mod-002",
                venue="Seminar Hall 2",
                prize="AWS Exam Voucher (top 10)",
            ),
            Event(
                event_id="evt-005",
                title="Inter-College Debate Championship",
                description="Annual debate competition on technology and society. Teams of 2. Topics announced 48 hours before the event.",
                skills_required=["public_speaking"],
                goal_tags=["compete", "network"],
                scope="inter_college",
                capacity_band="medium",
                capacity_limit=50,
                registered_count=12,
                registration_open_till=datetime(2025, 12, 10, tzinfo=timezone.utc),
                time_slot="fri-18:00",
                club_id="club-004",
                moderator_id="mod-002",
                venue="Conference Hall",
                prize="Trophy + ₹15,000",
            ),
            Event(
                event_id="evt-006",
                title="ML Model Deployment Workshop",
                description="Learn to deploy machine learning models using FastAPI, Docker, and cloud platforms. Build a production-ready ML pipeline.",
                skills_required=["machine_learning", "python", "cloud"],
                goal_tags=["learn", "build"],
                scope="intra_college",
                capacity_band="small",
                capacity_limit=25,
                registered_count=10,
                registration_open_till=datetime(2025, 11, 30, tzinfo=timezone.utc),
                time_slot="mon-09:00",
                club_id="club-001",
                moderator_id="mod-001",
                venue="Lab Block 2, Room 205",
                prize="Certificate + Project Showcase",
            ),
            Event(
                event_id="evt-007",
                title="Open Mic: Tech Talks",
                description="Share your ideas, projects, or research in a 5-minute lightning talk. Open to all departments. Great networking opportunity.",
                skills_required=["public_speaking"],
                goal_tags=["network", "learn"],
                scope="intra_college",
                capacity_band="medium",
                capacity_limit=40,
                registered_count=8,
                registration_open_till=datetime(2025, 12, 5, tzinfo=timezone.utc),
                time_slot="wed-14:00",
                club_id="club-004",
                moderator_id="mod-002",
                venue="Amphitheatre",
                prize="Best Speaker Award",
            ),
            Event(
                event_id="evt-008",
                title="Competitive Programming Contest",
                description="3-hour online coding contest with 5 algorithmic problems. Rated on Codeforces-style scoring. Individual participation.",
                skills_required=["python", "javascript"],
                goal_tags=["compete", "build"],
                scope="inter_college",
                capacity_band="large",
                capacity_limit=150,
                registered_count=89,
                registration_open_till=datetime(2025, 12, 15, tzinfo=timezone.utc),
                time_slot="thu-14:00",
                club_id="club-001",
                moderator_id="mod-001",
                venue="Online (HackerRank)",
                prize="₹20,000 + Internship Referrals",
            ),
        ]
        EVENT_STORE.extend(demo_events)
        save_events(EVENT_STORE)


_seed_demo_data()


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health() -> dict:
    return {"status": "ok", "events": len(EVENT_STORE), "clubs": len(CLUB_STORE)}


# ── Auth ──────────────────────────────────────────────────────────────────────

@app.post("/auth/login", response_model=LoginResponse)
def login(req: LoginRequest) -> LoginResponse:
    """Authenticate student or moderator by email + password."""
    if not req.email or not req.password:
        raise HTTPException(status_code=400, detail="Email and password are required")
    
    if req.role == "student":
        for profile in student_service.profiles.values():
            if profile.contact.lower() == req.email.lower() and profile.password == req.password:
                return LoginResponse(
                    success=True, role="student",
                    user_id=profile.student_id, full_name=profile.full_name,
                )
        raise HTTPException(status_code=401, detail="Invalid email or password")

    elif req.role == "moderator":
        for mod in MODERATOR_STORE.values():
            if mod.email.lower() == req.email.lower() and mod.password == req.password:
                return LoginResponse(
                    success=True, role="moderator",
                    user_id=mod.moderator_id, full_name=mod.full_name,
                )
        raise HTTPException(status_code=401, detail="Invalid email or password")

    raise HTTPException(status_code=400, detail="role must be student or moderator")


# ── Students ──────────────────────────────────────────────────────────────────

@app.post("/students/profile", response_model=StudentProfile)
def create_student_profile(profile: StudentProfile) -> StudentProfile:
    if not profile.student_id or not profile.full_name or not profile.contact:
        raise HTTPException(status_code=400, detail="student_id, full_name, and contact are required")
    result = student_service.create_profile(profile)
    save_students(student_service.profiles)
    return result


@app.get("/students/{student_id}", response_model=StudentProfile)
def get_student_profile(student_id: str) -> StudentProfile:
    profile = student_service.profiles.get(student_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="student not found")
    return profile


@app.get("/students", response_model=list[StudentProfile])
def list_students() -> list[StudentProfile]:
    return list(student_service.profiles.values())


# ── Moderators ────────────────────────────────────────────────────────────────

@app.get("/moderators/{moderator_id}", response_model=Moderator)
def get_moderator(moderator_id: str) -> Moderator:
    mod = MODERATOR_STORE.get(moderator_id)
    if mod is None:
        raise HTTPException(status_code=404, detail="moderator not found")
    return mod


# ── Event Registration ────────────────────────────────────────────────────────

@app.post("/events/register")
def register_for_event(req: RegisterEventRequest) -> dict:
    """Register a student for an event."""
    profile = student_service.profiles.get(req.student_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="student not found")

    event = next((e for e in EVENT_STORE if e.event_id == req.event_id), None)
    if event is None:
        raise HTTPException(status_code=404, detail="event not found")

    # Check if registration deadline has passed
    current_time = datetime.now(timezone.utc)
    if current_time > event.registration_open_till:
        raise HTTPException(status_code=400, detail="Registration deadline has passed for this event")

    if req.event_id in profile.registered_events:
        raise HTTPException(status_code=409, detail="already registered")

    if event.registered_count >= event.capacity_limit:
        raise HTTPException(status_code=400, detail="event is full")

    # Update event count
    idx = next(i for i, e in enumerate(EVENT_STORE) if e.event_id == req.event_id)
    EVENT_STORE[idx] = event.model_copy(update={"registered_count": event.registered_count + 1})

    # Update student registered list
    updated = profile.model_copy(update={"registered_events": profile.registered_events + [req.event_id]})
    student_service.profiles[req.student_id] = updated

    save_events(EVENT_STORE)
    save_students(student_service.profiles)

    return {"success": True, "message": f"Registered for {event.title}"}


@app.delete("/events/register")
def unregister_from_event(req: RegisterEventRequest) -> dict:
    """Unregister a student from an event."""
    profile = student_service.profiles.get(req.student_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="student not found")

    if req.event_id not in profile.registered_events:
        raise HTTPException(status_code=409, detail="not registered for this event")

    event = next((e for e in EVENT_STORE if e.event_id == req.event_id), None)
    if event:
        idx = next(i for i, e in enumerate(EVENT_STORE) if e.event_id == req.event_id)
        new_count = max(0, event.registered_count - 1)
        EVENT_STORE[idx] = event.model_copy(update={"registered_count": new_count})

    updated = profile.model_copy(update={
        "registered_events": [e for e in profile.registered_events if e != req.event_id]
    })
    student_service.profiles[req.student_id] = updated

    save_events(EVENT_STORE)
    save_students(student_service.profiles)

    return {"success": True, "message": "Unregistered successfully"}


# ── Clubs ─────────────────────────────────────────────────────────────────────

@app.post("/clubs", response_model=Club)
def create_club(club: Club) -> Club:
    if not club.club_id or not club.name:
        raise HTTPException(status_code=400, detail="club_id and name are required")
    CLUB_STORE[club.club_id] = club
    save_clubs(CLUB_STORE)
    return club


@app.get("/clubs", response_model=list[Club])
def list_clubs() -> list[Club]:
    return list(CLUB_STORE.values())


@app.get("/clubs/{club_id}", response_model=Club)
def get_club(club_id: str) -> Club:
    club = CLUB_STORE.get(club_id)
    if club is None:
        raise HTTPException(status_code=404, detail="club not found")
    return club


@app.delete("/clubs/{club_id}")
def delete_club(club_id: str) -> dict:
    if club_id not in CLUB_STORE:
        raise HTTPException(status_code=404, detail="club not found")
    del CLUB_STORE[club_id]
    save_clubs(CLUB_STORE)
    return {"success": True}


# ── Events ────────────────────────────────────────────────────────────────────

@app.post("/events", response_model=Event)
def create_event(event: Event) -> Event:
    if not event.event_id or not event.title:
        raise HTTPException(status_code=400, detail="event_id and title are required")
    if event.capacity_limit <= 0:
        raise HTTPException(status_code=400, detail="capacity_limit must be greater than 0")
    if event.registered_count < 0:
        raise HTTPException(status_code=400, detail="registered_count cannot be negative")
    EVENT_STORE.append(event)
    save_events(EVENT_STORE)
    return event


@app.get("/events", response_model=list[Event])
def list_events() -> list[Event]:
    return EVENT_STORE


@app.get("/events/{event_id}", response_model=Event)
def get_event(event_id: str) -> Event:
    event = next((e for e in EVENT_STORE if e.event_id == event_id), None)
    if event is None:
        raise HTTPException(status_code=404, detail="event not found")
    return event


@app.get("/events/{event_id}/registrations", response_model=list[str])
def get_event_registrations(event_id: str) -> list[str]:
    """Get list of student IDs registered for a specific event."""
    event = next((e for e in EVENT_STORE if e.event_id == event_id), None)
    if event is None:
        raise HTTPException(status_code=404, detail="event not found")
    
    registered_students = [
        student_id for student_id, profile in student_service.profiles.items()
        if event_id in profile.registered_events
    ]
    return registered_students


@app.delete("/events/{event_id}")
def delete_event(event_id: str) -> dict:
    idx = next((i for i, e in enumerate(EVENT_STORE) if e.event_id == event_id), None)
    if idx is None:
        raise HTTPException(status_code=404, detail="event not found")
    EVENT_STORE.pop(idx)
    save_events(EVENT_STORE)
    return {"success": True}


@app.get("/search", response_model=list[Event])
def search_events(q: str) -> list[Event]:
    if not q or not q.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty")
    return student_service.browse_events(events=EVENT_STORE, query=q, algorithm="kmp")


@app.post("/events/search", response_model=list[Event])
def search_events_advanced(payload: SearchQuery) -> list[Event]:
    if not payload.query or not payload.query.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty")
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
    profile = student_service.profiles.get(user_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="student not found")
    ranked = student_service.recommend(profile, EVENT_STORE, top_k=5)
    return [RecommendationResult(event=event, score=score) for score, event in ranked]
