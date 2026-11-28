"""Create the hydroponic sensor table and insert repeatable demo readings.

Usage:
    uv run python seed_db.py

The script is safe to run more than once: each sample row has a stable key and
is updated in place on subsequent runs.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from db import connect_db

SCHEMA_SQL = "CREATE SCHEMA IF NOT EXISTS hidroponik"
TABLE_SQL = """
CREATE TABLE IF NOT EXISTS hidroponik.sensor_readings (
    reading_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sample_key TEXT UNIQUE,
    recorded_at TIMESTAMPTZ NOT NULL,
    ph NUMERIC(4, 2) NOT NULL CHECK (ph BETWEEN 0 AND 14),
    ec_ms_cm NUMERIC(6, 3) NOT NULL CHECK (ec_ms_cm >= 0),
    water_temp_c NUMERIC(5, 2) NOT NULL,
    air_temp_c NUMERIC(5, 2) NOT NULL,
    humidity_pct NUMERIC(5, 2) NOT NULL CHECK (humidity_pct BETWEEN 0 AND 100),
    water_level_pct NUMERIC(5, 2) NOT NULL CHECK (water_level_pct BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
"""
INDEX_SQL = """
CREATE INDEX IF NOT EXISTS idx_sensor_readings_recorded_at
ON hidroponik.sensor_readings (recorded_at DESC)
"""
UPSERT_SQL = """
INSERT INTO hidroponik.sensor_readings (
    sample_key, recorded_at, ph, ec_ms_cm, water_temp_c, air_temp_c,
    humidity_pct, water_level_pct
)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON CONFLICT (sample_key) DO UPDATE SET
    recorded_at = EXCLUDED.recorded_at,
    ph = EXCLUDED.ph,
    ec_ms_cm = EXCLUDED.ec_ms_cm,
    water_temp_c = EXCLUDED.water_temp_c,
    air_temp_c = EXCLUDED.air_temp_c,
    humidity_pct = EXCLUDED.humidity_pct,
    water_level_pct = EXCLUDED.water_level_pct
"""

# Typical demonstration values around a healthy hydroponic operating range.
SAMPLE_VALUES = [
    (5.72, 1.42, 21.8, 27.1, 68.0, 88.0),
    (5.75, 1.44, 21.9, 27.3, 67.5, 87.0),
    (5.78, 1.46, 22.0, 27.8, 66.8, 86.0),
    (5.81, 1.48, 22.1, 28.2, 66.0, 84.0),
    (5.79, 1.47, 22.0, 28.0, 66.5, 83.0),
    (5.76, 1.45, 21.9, 27.6, 67.2, 82.0),
    (5.73, 1.43, 21.8, 27.2, 68.1, 80.0),
    (5.70, 1.41, 21.7, 26.8, 69.0, 79.0),
    (5.74, 1.44, 21.8, 27.0, 68.4, 78.0),
    (5.77, 1.46, 21.9, 27.5, 67.7, 77.0),
    (5.80, 1.49, 22.1, 28.1, 66.9, 76.0),
    (5.78, 1.47, 22.0, 27.9, 67.3, 75.0),
]


def seed_database() -> int:
    """Create schema/table and upsert twelve sample readings."""
    now = datetime.now(timezone.utc).replace(second=0, microsecond=0)
    rows = [
        (f"demo-{i + 1:02d}", now - timedelta(hours=len(SAMPLE_VALUES) - i - 1), *values)
        for i, values in enumerate(SAMPLE_VALUES)
    ]

    with connect_db() as connection:
        with connection.cursor() as cursor:
            cursor.execute(SCHEMA_SQL)
            cursor.execute(TABLE_SQL)
            cursor.execute(INDEX_SQL)
            cursor.executemany(UPSERT_SQL, rows)
    return len(rows)


if __name__ == "__main__":
    count = seed_database()
    print(f"Seeding selesai: {count} baris contoh di hidroponik.sensor_readings.")
