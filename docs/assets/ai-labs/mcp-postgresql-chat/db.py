"""Shared PostgreSQL helpers for the hydroponic MCP demo."""

from __future__ import annotations

import os
from typing import Any

import psycopg
from dotenv import load_dotenv
from psycopg.rows import dict_row

load_dotenv()


def connect_db() -> psycopg.Connection[dict[str, Any]]:
    """Open a PostgreSQL connection using DATABASE_URL from the project .env."""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError(
            "DATABASE_URL belum diatur. Tambahkan URL PostgreSQL ke file .env."
        )
    return psycopg.connect(database_url, row_factory=dict_row)


def json_safe(value: Any) -> Any:
    """Convert database-specific values into JSON-friendly values."""
    if hasattr(value, "isoformat"):
        return value.isoformat()
    if hasattr(value, "__float__") and not isinstance(value, (int, float)):
        return float(value)
    return value
