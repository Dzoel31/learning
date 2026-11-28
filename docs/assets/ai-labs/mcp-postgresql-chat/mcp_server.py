"""FastMCP SSE server exposing read-only hydroponic sensor tools."""

from __future__ import annotations

import os
from typing import Any

from dotenv import load_dotenv
from fastmcp import FastMCP

from db import connect_db, json_safe

load_dotenv()

mcp = FastMCP("Demo Sensor Hidroponik")


@mcp.tool
def list_tables() -> list[dict[str, str]]:
    """Tampilkan daftar tabel pada skema hidroponik."""
    with connect_db() as connection, connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT table_schema, table_name, table_type
            FROM information_schema.tables
            WHERE table_schema = 'hidroponik'
            ORDER BY table_name
            """
        )
        return [dict(row) for row in cursor.fetchall()]


@mcp.tool
def get_data_summary(hours: int = 24) -> dict[str, Any]:
    """Rangkum jumlah dan nilai sensor rata-rata/minimum/maksimum beberapa jam terakhir."""
    hours = max(1, min(hours, 8760))
    with connect_db() as connection, connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT COUNT(*) AS reading_count,
                   MIN(recorded_at) AS first_reading,
                   MAX(recorded_at) AS last_reading,
                   ROUND(AVG(ph), 2) AS avg_ph,
                   ROUND(MIN(ph), 2) AS min_ph,
                   ROUND(MAX(ph), 2) AS max_ph,
                   ROUND(AVG(ec_ms_cm), 3) AS avg_ec_ms_cm,
                   ROUND(AVG(water_temp_c), 2) AS avg_water_temp_c,
                   ROUND(AVG(air_temp_c), 2) AS avg_air_temp_c,
                   ROUND(AVG(humidity_pct), 2) AS avg_humidity_pct,
                   ROUND(AVG(water_level_pct), 2) AS avg_water_level_pct
            FROM hidroponik.sensor_readings
            WHERE recorded_at >= now() - (%s * interval '1 hour')
            """,
            (hours,),
        )
        row = cursor.fetchone()
    return {key: json_safe(value) for key, value in row.items()} | {"hours": hours}


@mcp.tool
def get_latest_reading() -> dict[str, Any] | None:
    """Ambil satu pembacaan sensor paling baru."""
    with connect_db() as connection, connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT reading_id, recorded_at, ph, ec_ms_cm, water_temp_c,
                   air_temp_c, humidity_pct, water_level_pct
            FROM hidroponik.sensor_readings
            ORDER BY recorded_at DESC
            LIMIT 1
            """
        )
        row = cursor.fetchone()
    return {key: json_safe(value) for key, value in row.items()} if row else None


if __name__ == "__main__":
    mcp.run(
        transport="sse",
        host=os.getenv("MCP_HOST", "127.0.0.1"),
        port=int(os.getenv("MCP_PORT", "8000")),
        path="/sse",
    )
