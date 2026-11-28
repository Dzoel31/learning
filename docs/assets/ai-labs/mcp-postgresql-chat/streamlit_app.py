"""Primary Streamlit chat client for the hydroponic MCP demo."""

from __future__ import annotations

import streamlit as st

from mcp_chat import ask_mcp

st.set_page_config(page_title="Chat Sensor Hidroponik", page_icon=":material/water_drop:", layout="centered")
st.title(":material/water_drop: Sensor hidroponik")
st.caption("Tanya tabel, rangkuman pembacaan, atau data sensor terbaru melalui MCP.")

with st.sidebar:
    st.header("Koneksi MCP")
    endpoint = st.text_input(
        "MCP endpoint",
        value=st.session_state.get("mcp_endpoint", "http://127.0.0.1:8000/sse"),
        help="Alamat SSE server FastMCP, biasanya berakhir dengan /sse.",
    )
    st.session_state["mcp_endpoint"] = endpoint
    st.caption("LLM: openai/gpt-oss-120b via Groq")
    if st.button("Bersihkan percakapan", width="stretch"):
        st.session_state.messages = []

if "messages" not in st.session_state:
    st.session_state.messages = []

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

if prompt := st.chat_input("Contoh: rangkum data sensor 12 jam terakhir"):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        try:
            with st.status("Menghubungi MCP dan Groq", type="compact") as status:
                answer = ask_mcp(
                    endpoint,
                    st.session_state.messages[:-1],
                    prompt,
                )
                status.update(label="Selesai", state="complete")
            st.markdown(answer)
        except Exception as exc:
            answer = f"Koneksi atau permintaan gagal: {exc}"
            st.error(answer, title="Tidak dapat mengambil data")
    st.session_state.messages.append({"role": "assistant", "content": answer})
