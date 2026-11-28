"""Gradio alternative UI for the hydroponic MCP demo."""

from __future__ import annotations

import gradio as gr

from mcp_chat import ask_mcp


def respond(message: str, history: list[dict[str, str]], endpoint: str) -> str:
    try:
        return ask_mcp(endpoint, history, message)
    except Exception as exc:
        return f"Koneksi atau permintaan gagal: {exc}"


with gr.Blocks(title="Chat Sensor Hidroponik") as demo:
    gr.Markdown("# 🌱 Sensor hidroponik\nTanya data sensor lewat MCP Server dan Groq GPT-OSS-120B.")
    endpoint = gr.Textbox(
        label="MCP endpoint",
        value="http://127.0.0.1:8000/sse",
        info="Alamat SSE FastMCP; biasanya berakhir dengan /sse.",
    )
    gr.ChatInterface(
        fn=respond,
        chatbot=gr.Chatbot(height=500),
        textbox=gr.Textbox(placeholder="Contoh: data sensor paling baru apa?", container=False),
        additional_inputs=[endpoint],
        examples=[
            ["Tabel apa saja yang tersedia?", "http://127.0.0.1:8000/sse"],
            ["Rangkum data sensor 12 jam terakhir.", "http://127.0.0.1:8000/sse"],
            ["Tampilkan data sensor terakhir.", "http://127.0.0.1:8000/sse"],
        ],
    )


if __name__ == "__main__":
    demo.launch()
