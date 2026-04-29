"""String-search provider for event discovery using KMP and Rabin-Karp."""

from __future__ import annotations

from app.models.schemas import Event


class SearchProvider:
    """Provides exact/substring search over event title and description."""

    @staticmethod
    def _kmp_lps(pattern: str) -> list[int]:
        """Build longest-prefix-suffix (LPS) table for KMP.

        Time Complexity:
            O(m), where m is the pattern length.
        """
        lps = [0] * len(pattern)
        length = 0
        index = 1

        while index < len(pattern):
            if pattern[index] == pattern[length]:
                length += 1
                lps[index] = length
                index += 1
            elif length > 0:
                length = lps[length - 1]
            else:
                lps[index] = 0
                index += 1

        return lps

    @classmethod
    def kmp_contains(cls, text: str, pattern: str) -> bool:
        """Return True if pattern exists in text using KMP.

        Time Complexity:
            O(n + m), where n is text length and m is pattern length.
        """
        if pattern == "":
            return True
        if text == "":
            return False

        lps = cls._kmp_lps(pattern)
        text_idx = 0
        pat_idx = 0

        while text_idx < len(text):
            if text[text_idx] == pattern[pat_idx]:
                text_idx += 1
                pat_idx += 1
                if pat_idx == len(pattern):
                    return True
            elif pat_idx > 0:
                pat_idx = lps[pat_idx - 1]
            else:
                text_idx += 1

        return False

    @staticmethod
    def rabin_karp_contains(text: str, pattern: str) -> bool:
        """Return True if pattern exists in text using Rabin-Karp hashing.

        Expected Time Complexity:
            O(n + m)
        Worst-case Time Complexity:
            O(n * m) due to hash collisions.
        """
        if pattern == "":
            return True

        n = len(text)
        m = len(pattern)
        if n < m:
            return False

        base = 256
        modulus = 1_000_000_007

        high_base = 1
        for _ in range(m - 1):
            high_base = (high_base * base) % modulus

        pattern_hash = 0
        window_hash = 0

        for idx in range(m):
            pattern_hash = (pattern_hash * base + ord(pattern[idx])) % modulus
            window_hash = (window_hash * base + ord(text[idx])) % modulus

        for start in range(n - m + 1):
            if pattern_hash == window_hash:
                if text[start : start + m] == pattern:
                    return True

            if start < n - m:
                outgoing = (ord(text[start]) * high_base) % modulus
                window_hash = (window_hash - outgoing + modulus) % modulus
                window_hash = (window_hash * base + ord(text[start + m])) % modulus

        return False

    def search_events(
        self,
        events: list[Event],
        query: str,
        algorithm: str = "kmp",
        limit: int | None = None,
    ) -> list[Event]:
        """Search events by query in title/description.

        Time Complexity:
            O(E * (T + Q)) for KMP and expected O(E * (T + Q)) for Rabin-Karp,
            where E is number of events, T is average text length,
            and Q is query length.
        """
        normalized_query = query.strip().lower()
        if not normalized_query:
            return events[:limit] if limit else events

        matcher = self.kmp_contains
        if algorithm.lower() == "rabin_karp":
            matcher = self.rabin_karp_contains

        matches: list[Event] = []

        for event in events:
            corpus = f"{event.title} {event.description}".lower()
            if matcher(corpus, normalized_query):
                matches.append(event)
                if limit and len(matches) >= limit:
                    break

        return matches
