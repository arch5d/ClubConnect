"""Moderator flow services: subspace/event creation and BFS analytics."""

from __future__ import annotations

from collections import deque

from app.models.schemas import Event


class ModeratorService:
    """Contains moderator-side operations for club admins."""

    def __init__(self) -> None:
        self.subspaces: dict[str, dict] = {}
        self.events: dict[str, Event] = {}

    def create_subspace(self, subspace_id: str, title: str, description: str) -> dict:
        """Create a logical subspace for a club domain.

        Time Complexity:
            O(1)
        """
        payload = {
            "subspace_id": subspace_id,
            "title": title,
            "description": description,
        }
        self.subspaces[subspace_id] = payload
        return payload

    def register_event(self, event: Event) -> Event:
        """Register a new event defined by moderator constraints.

        Time Complexity:
            O(1)
        """
        self.events[event.event_id] = event
        return event

    @staticmethod
    def analytics_bfs_trends(
        club_graph: dict[str, list[str]], start_club: str
    ) -> dict[str, int]:
        """Return BFS level trends from a start club in relationship graph.

        Levels approximate influence radius over connected clubs for dashboard
        trend visualizations.

        Time Complexity:
            O(V + E), where V is club count and E is relationship edges.
        """
        if start_club not in club_graph:
            return {}

        queue: deque[tuple[str, int]] = deque([(start_club, 0)])
        visited = {start_club}
        levels: dict[str, int] = {start_club: 0}

        while queue:
            node, depth = queue.popleft()
            for neighbor in club_graph.get(node, []):
                if neighbor in visited:
                    continue
                visited.add(neighbor)
                levels[neighbor] = depth + 1
                queue.append((neighbor, depth + 1))

        return levels
