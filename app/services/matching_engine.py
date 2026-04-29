"""Recommendation and ranking logic using heap-based Top-K and greedy strategy."""

from __future__ import annotations

import heapq
from dataclasses import dataclass

from app.models.schemas import Event, StudentProfile


@dataclass(frozen=True)
class ScoreWeights:
    """Weights for recommendation score components."""

    skill_complement: float = 0.5
    goal_matching: float = 0.3
    availability: float = 0.2


class MatchingEngine:
    """Computes recommendation scores and returns top event suggestions."""

    def __init__(self, weights: ScoreWeights | None = None) -> None:
        self.weights = weights or ScoreWeights()

    @staticmethod
    def _skill_complement_score(student: StudentProfile, event: Event) -> float:
        """Return skill complement score.

        Time Complexity:
            O(s + e), where s is student skill count and e is event skill count.
        """
        required = set(event.skills_required)
        if not required:
            return 1.0
        possessed = set(student.skills)
        matched = len(required & possessed)
        return matched / len(required)

    @staticmethod
    def _goal_matching_score(student: StudentProfile, event: Event) -> float:
        """Return goal overlap score.

        Time Complexity:
            O(gs + ge), where gs is student goal count and ge is event goal count.
        """
        event_goals = set(event.goal_tags)
        if not event_goals:
            return 1.0
        student_goals = set(student.goals)
        overlap = len(student_goals & event_goals)
        return overlap / len(event_goals)

    @staticmethod
    def _availability_score(student: StudentProfile, event: Event) -> float:
        """Return availability compatibility score.

        Time Complexity:
            O(a), where a is student availability slot count.
        """
        return 1.0 if event.time_slot in set(student.available_slots) else 0.0

    def calculate_weighted_score(self, student: StudentProfile, event: Event) -> float:
        """Compute weighted recommendation score in [0, 1].

        Time Complexity:
            O(s + e + gs + ge + a), due to skill, goal, and availability checks.
        """
        skill_score = self._skill_complement_score(student, event)
        goal_score = self._goal_matching_score(student, event)
        availability_score = self._availability_score(student, event)

        weighted_sum = (
            skill_score * self.weights.skill_complement
            + goal_score * self.weights.goal_matching
            + availability_score * self.weights.availability
        )
        return round(weighted_sum, 4)

    def top_k_recommendations(
        self, student: StudentProfile, events: list[Event], k: int
    ) -> list[tuple[float, Event]]:
        """Return Top-K events using a min-heap.

        Uses heap size k to keep the best events seen so far and guarantees
        O(n log k) ranking complexity.

        Time Complexity:
            O(n log k), where n is number of events.
        """
        if k <= 0:
            return []

        heap: list[tuple[float, str, Event]] = []

        for event in events:
            if event.registered_count >= event.capacity_limit:
                continue

            score = self.calculate_weighted_score(student, event)
            item = (score, event.event_id, event)

            if len(heap) < k:
                heapq.heappush(heap, item)
            elif score > heap[0][0]:
                heapq.heapreplace(heap, item)

        ranked = sorted(heap, key=lambda row: row[0], reverse=True)
        return [(score, event) for score, _, event in ranked]

    def greedy_select_non_conflicting(
        self, ranked_events: list[tuple[float, Event]], max_events: int
    ) -> list[tuple[float, Event]]:
        """Greedily pick highest-scored events without duplicate time slots.

        Time Complexity:
            O(r), where r is number of ranked events.
        """
        if max_events <= 0:
            return []

        selected: list[tuple[float, Event]] = []
        used_slots: set[str] = set()

        for score, event in ranked_events:
            if event.time_slot in used_slots:
                continue
            selected.append((score, event))
            used_slots.add(event.time_slot)
            if len(selected) == max_events:
                break

        return selected
