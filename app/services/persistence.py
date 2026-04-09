"""JSON file-based persistence for students, clubs, and events."""

from __future__ import annotations

import json
import os
from datetime import datetime
from pathlib import Path

from app.models.schemas import Club, Event, StudentProfile

DATA_DIR = Path("data")
STUDENTS_FILE = DATA_DIR / "students.json"
EVENTS_FILE = DATA_DIR / "events.json"
CLUBS_FILE = DATA_DIR / "clubs.json"


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
    records = _read_json(STUDENTS_FILE)
    result: dict[str, StudentProfile] = {}
    for r in records:
        try:
            p = StudentProfile(**r)
            result[p.student_id] = p
        except Exception:
            pass
    return result


def save_students(profiles: dict[str, StudentProfile]) -> None:
    _write_json(STUDENTS_FILE, [p.model_dump() for p in profiles.values()])


# ── Events ────────────────────────────────────────────────────────────────────

def load_events() -> list[Event]:
    records = _read_json(EVENTS_FILE)
    result: list[Event] = []
    for r in records:
        try:
            result.append(Event(**r))
        except Exception:
            pass
    return result


def save_events(events: list[Event]) -> None:
    _write_json(EVENTS_FILE, [e.model_dump() for e in events])


# ── Clubs ─────────────────────────────────────────────────────────────────────

def load_clubs() -> dict[str, Club]:
    records = _read_json(CLUBS_FILE)
    result: dict[str, Club] = {}
    for r in records:
        try:
            c = Club(**r)
            result[c.club_id] = c
        except Exception:
            pass
    return result


def save_clubs(clubs: dict[str, Club]) -> None:
    _write_json(CLUBS_FILE, [c.model_dump() for c in clubs.values()])
