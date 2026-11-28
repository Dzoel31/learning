"""Shared OpenAI SDK + MCP client loop for both UIs."""

from __future__ import annotations

import asyncio
import json
import os
from typing import Any

from dotenv import load_dotenv
from fastmcp import Client
from fastmcp.client.transports import SSETransport
from openai import OpenAI

load_dotenv()

MODEL = "openai/gpt-oss-120b"
SYSTEM_PROMPT = """Kamu asisten demo sensor hidroponik berbahasa Indonesia.
Gunakan tool MCP untuk menjawab pertanyaan tentang tabel dan data sensor.
Jangan mengarang nilai sensor. Jelaskan rentang waktu rangkuman yang dipakai.
Jika tool gagal, sampaikan error secara ringkas dan minta pengguna memeriksa
endpoint MCP, koneksi PostgreSQL, serta seeding.
"""


def _field(obj: Any, key: str, default: Any = None) -> Any:
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)


def _json_schema(tool: Any) -> dict[str, Any]:
    schema = _field(tool, "inputSchema") or _field(tool, "input_schema") or {
        "type": "object",
        "properties": {},
    }
    return {
        "type": "function",
        "function": {
            "name": _field(tool, "name"),
            "description": _field(tool, "description") or "Panggil tool MCP.",
            "parameters": schema,
        },
    }


def _tool_result_text(result: Any) -> str:
    data = _field(result, "data")
    if data is not None:
        return json.dumps(data, ensure_ascii=False, default=str)
    structured = _field(result, "structuredContent") or _field(
        result, "structured_content"
    )
    if structured is not None:
        return json.dumps(structured, ensure_ascii=False, default=str)
    content = _field(result, "content", [])
    return "\n".join(str(_field(item, "text", item)) for item in content)


async def _ask_mcp(
    endpoint: str,
    history: list[dict[str, Any]],
    prompt: str,
) -> str:
    api_key = os.getenv("LLM_API_KEY")
    if not api_key:
        raise RuntimeError("LLM_API_KEY belum diatur di file .env.")

    # The Groq endpoint is OpenAI-compatible, keeping the teaching example on
    # the same OpenAI Python SDK used elsewhere in the course.
    llm = OpenAI(
        api_key=api_key,
        base_url="https://api.groq.com/openai/v1",
    )
    messages: list[dict[str, Any]] = [{"role": "system", "content": SYSTEM_PROMPT}]
    for item in history[-12:]:
        role = item.get("role")
        content = item.get("content")
        if role in {"user", "assistant"} and isinstance(content, str):
            messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": prompt})

    async with Client(SSETransport(endpoint)) as mcp_client:
        discovered = await mcp_client.list_tools()
        tools = [_json_schema(tool) for tool in discovered]
        if not tools:
            raise RuntimeError("Tidak ada tool yang ditemukan pada endpoint MCP.")

        for _ in range(5):
            response = llm.chat.completions.create(
                model=MODEL,
                messages=messages,
                tools=tools,
                tool_choice="auto",
                temperature=0.2,
            )
            message = response.choices[0].message
            assistant_message: dict[str, Any] = {
                "role": "assistant",
                "content": message.content,
            }
            if message.tool_calls:
                assistant_message["tool_calls"] = [
                    call.model_dump(exclude_none=True) for call in message.tool_calls
                ]
            messages.append(assistant_message)

            if not message.tool_calls:
                return message.content or "Model tidak mengembalikan teks jawaban."

            for call in message.tool_calls:
                try:
                    arguments = json.loads(call.function.arguments or "{}")
                    result = await mcp_client.call_tool(call.function.name, arguments)
                    result_text = _tool_result_text(result)
                except Exception as exc:  # surfaced to the model for a useful answer
                    result_text = json.dumps({"error": str(exc)}, ensure_ascii=False)
                messages.append(
                    {
                        "role": "tool",
                        "tool_call_id": call.id,
                        "content": result_text,
                    }
                )
        return "Percakapan mencapai batas lima putaran tool. Coba pertanyaan yang lebih spesifik."


def ask_mcp(
    endpoint: str,
    history: list[dict[str, Any]],
    prompt: str,
) -> str:
    """Synchronous wrapper for Streamlit and Gradio callbacks."""
    endpoint = endpoint.strip()
    if not endpoint:
        raise ValueError("Endpoint MCP belum diisi.")
    return asyncio.run(_ask_mcp(endpoint, history, prompt))
