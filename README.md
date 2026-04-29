# DAA-T160: Algorithm-Driven College Events Recommendation System

## Backend Stack
- FastAPI
- Python 3.11+
- DAA modules: Heap-based Top-K, Greedy selection, KMP, Rabin-Karp, BFS analytics

## Quick Start
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Implemented Core Classes
- `MatchingEngine` in `app/services/matching_engine.py`
  - Weighted scoring: Skill Complement + Goal Matching + Availability
  - Heap-based Top-K with `heapq` (`O(n log k)`)
  - Greedy non-conflicting time-slot selection
- `SearchProvider` in `app/services/search_provider.py`
  - KMP string search (`O(n + m)`)
  - Rabin-Karp search (expected `O(n + m)`, worst `O(nm)`)

## Example APIs
- `POST /students/profile`
- `POST /events`
- `POST /events/search`
- `GET /students/{student_id}/recommendations?top_k=5`
- `GET /health`
