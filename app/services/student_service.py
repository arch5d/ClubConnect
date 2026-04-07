"""Student flow services: profile onboarding and recommendation access."""

from __future__ import annotations

from app.models.schemas import Event, StudentProfile
from app.services.matching_engine import MatchingEngine
from app.services.search_provider import SearchProvider


class StudentService:
    """Contains student-side operations for browsing and registration."""

    def __init__(self) -> None:
        self.profiles: dict[str, StudentProfile] = {}
        self.search_provider = SearchProvider()
        self.matching_engine = MatchingEngine()

    def create_profile(self, profile: StudentProfile) -> StudentProfile:
        """Create or replace a student profile.

        Time Complexity:
            O(1)
        """
        self.profiles[profile.student_id] = profile
        return profile

    def browse_events(
        self,
        events: list[Event],
        query: str,
        algorithm: str = "kmp",
        limit: int | None = None,
    ) -> list[Event]:
        """Search events using KMP or Rabin-Karp.

        Time Complexity:
            Delegates to SearchProvider.search_events().
        """
        return self.search_provider.search_events(
            events=events,
            query=query,
            algorithm=algorithm,
            limit=limit,
        )

    def recommend(
        self, student: StudentProfile, events: list[Event], top_k: int = 5
    ) -> list[tuple[float, Event]]:
        """Return greedy filtered Top-K recommendations.

        Time Complexity:
            O(n log k), dominated by heap-based ranking.
        """
        ranked = self.matching_engine.top_k_recommendations(student, events, top_k)
        return self.matching_engine.greedy_select_non_conflicting(ranked, top_k)
