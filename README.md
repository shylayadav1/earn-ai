# Earn AI: Purdue Student Wealth Architect

Earn AI is an agentic **Retrieval-Augmented Generation (RAG)** system designed to help Purdue University students navigate complex financial data. Unlike standard chatbots, Earn AI utilizes a native tool-calling architecture to autonomously retrieve, calculate, and synthesize information from unstructured sources like tuition PDFs and FAFSA guides.


* **Agentic Reasoning**: Uses a recursive execution loop to determine when and which tools to call based on user intent.
* **High-Accuracy RAG**: Replaces traditional "blind" prompt injection with a standardized tool-calling interface.
* **In-Memory Caching**: Loads PDF data into RAM at startup to provide sub-second response times.
* **Robust Retrieval**: Implements a keyword-intersection search algorithm to handle messy PDF table extractions and formatting.
* **Stateful Memory**: Maintains a dynamic conversation history to support complex, multi-step financial inquiries.

## ech Stack

* **Frontend**: React (Modern, Minimalist FinTech UI)
* **Backend**: FastAPI (Python)
* **AI Model**: Google Gemini 1.5 Flash
* **Data Processing**: PyPDF2
* **Protocol**: Inspired by Model Context Protocol (MCP)

## Architecture

The system follows a modular three-layer architecture:

1.  **The Brain (Gemini)**: Processes natural language, identifies intent, and generates tool-calling schemas.
2.  **The Orchestrator (FastAPI)**: Manages the `while True` agent loop, handles tool execution logic, and maintains conversation state.
3.  **The Tool Layer (mcp_tools.py)**: A modular library of Python functions for PDF parsing, keyword searching, and financial calculations.

## 📂 Project Structure

```text
backend/
├── data/               # Purdue Tuition & FAFSA PDFs
├── main.py             # FastAPI App & Agentic Orchestration
├── mcp_tools.py        # Core Logic & PDF Tool Definitions
├── .env                # API Keys
└── requirements.txt    # Dependencies
