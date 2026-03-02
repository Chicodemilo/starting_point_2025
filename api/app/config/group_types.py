# ==============================================================================
# File:      api/app/config/group_types.py
# Purpose:   Defines the allowed group type taxonomy. Provides validation
#            helpers to check if a given type key is valid. Edit this file
#            when forking the boilerplate for a new project.
# Callers:   group_service.py, routes/config.py, config/__init__.py
# Callees:   (none -- pure data/config)
# Modified:  2026-03-01
# ==============================================================================
# Group Types Configuration
# Edit this file when forking the boilerplate for your project.
# Examples:
#   Book club app: [{"key": "book_club", "label": "Book Club"}, {"key": "movie_club", "label": "Movie Club"}]
#   Fantasy sports: [{"key": "league", "label": "League"}, {"key": "division", "label": "Division"}]
#   Social app:    [{"key": "friend_group", "label": "Friend Group"}, {"key": "team", "label": "Team"}]

GROUP_TYPES = [
    {"key": "club", "label": "Club"},
    {"key": "team", "label": "Team"},
    {"key": "league", "label": "League"},
    {"key": "group", "label": "Group"},
]


def get_valid_type_keys():
    """Return list of valid group type keys"""
    return [t["key"] for t in GROUP_TYPES]


def is_valid_type(type_key):
    """Check if a group type key is valid"""
    return type_key in get_valid_type_keys()
