"""JSON file-based persistence for all entities."""

from __future__ import annotations

import json
from pathlib import Path

from app.models.schemas import Club, Event, Moderator, StudentProfile

DATA_DIR = Path("data")
STUDENTS_FILE = DATA_DIR / "students.json"
EVENTS_FILE = DATA_DIR / "events.json"
CLUBS_FILE = DATA_DIR / "clubs.json"
MODERATORS_FILE = DATA_DIR / "moderators.json"


def _ensure_dir() -> None:
    DATA_DIR.mkdir(exist_ok=True)


def _read_json(path: Path) -> list[dict]:
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _write_json(path: Path, data: list[dict]) -> None:
    _ensure_dir()
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, default=str)


# ── Students ──────────────────────────────────────────────────────────────────

def load_students() -> dict[str, StudentProfile]:
    result: dict[str, StudentProfile] = {}
    for r in _read_json(STUDENTS_FILE):
        try:
            p = StudentProfile(**r)
            result[p.student_id] = p
        except Exception:
            pass
    return result


def save_students(profiles: dict[str, StudentProfile]) -> None:
    _write_json(STUDENTS_FILE, [p.model_dump() for p in profiles.values()])


# ── Moderators ────────────────────────────────────────────────────────────────

def load_moderators() -> dict[str, Moderator]:
    result: dict[str, Moderator] = {}
    for r in _read_json(MODERATORS_FILE):
        try:
            m = Moderator(**r)
            result[m.moderator_id] = m
        except Exception:
            pass
    return result


def save_moderators(moderators: dict[str, Moderator]) -> None:
    _write_json(MODERATORS_FILE, [m.model_dump() for m in moderators.values()])


# ── Events ────────────────────────────────────────────────────────────────────

def load_events() -> list[Event]:
    result: list[Event] = []
    for r in _read_json(EVENTS_FILE):
        try:
            result.append(Event(**r))
        except Exception:
            pass
    return result


def save_events(events: list[Event]) -> None:
    _write_json(EVENTS_FILE, [e.model_dump() for e in events])


# ── Clubs ─────────────────────────────────────────────────────────────────────

def load_clubs() -> dict[str, Club]:
    result: dict[str, Club] = {}
    for r in _read_json(CLUBS_FILE):
        try:
            c = Club(**r)
            result[c.club_id] = c
        except Exception:
            pass
    return result


def save_clubs(clubs: dict[str, Club]) -> None:
    _write_json(CLUBS_FILE, [c.model_dump() for c in clubs.values()])
