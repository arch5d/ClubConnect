"""Enumerations used across ClubConnect domain models."""

from enum import Enum


class Skill(str, Enum):
    """Supported skill tags for students and events."""

    PYTHON = "python"
    JAVASCRIPT = "javascript"
    UI_UX = "ui_ux"
    DATA_ANALYSIS = "data_analysis"
    PUBLIC_SPEAKING = "public_speaking"
    CLOUD = "cloud"
    MACHINE_LEARNING = "machine_learning"


class Scope(str, Enum):
    """Event reach scope."""

    INTRA_COLLEGE = "intra_college"
    INTER_COLLEGE = "inter_college"


class CapacityBand(str, Enum):
    """Capacity bands to simplify event sizing."""

    SMALL = "small"
    MEDIUM = "medium"
    LARGE = "large"


class Goal(str, Enum):
    """Primary student and event intent categories."""

    LEARN = "learn"
    NETWORK = "network"
    BUILD = "build"
    COMPETE = "compete"
