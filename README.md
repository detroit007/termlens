# 🔍 TermLens

> **Intelligent AI Term Explainer Agent**  
> *Zooming in on complex AI concepts through multi-layered mental models, real-world examples, and interactive recall.*

---

## 💡 Project Overview

**TermLens** is an agentic AI educational system designed to deconstruct complex machine learning and artificial intelligence jargon into intuitive, retainable understanding. Rather than returning dense academic papers or superficial one-liners, TermLens transforms any AI term into a structured **4-Layer Cognitive Breakdown**:

1. 🎯 **Simple (ELI5)**: A concise, single-line explanation capturing the core essence without jargon.
2. 🧠 **Mental Model**: A vivid real-world analogy or cognitive anchor that makes the abstraction stick.
3. 💡 **Practical Examples**: Concrete, real-world applications showing how the concept works in production.
4. ❓ **Interactive Quiz**: A bite-sized concept check with multiple choices or thought prompts to test comprehension.

---

## 🧩 The 4-Layer Concept Format

Here is how TermLens structures every explanation:

### Example: `RAG (Retrieval-Augmented Generation)`

| Layer | Content |
| :--- | :--- |
| **Simple** | An AI technique that lets language models search external documents for up-to-date facts before generating an answer. |
| **Mental Model** | Like taking an open-book exam: instead of relying only on memory (weights), the student looks up specific reference books (retrieval) to answer accurately. |
| **Examples** | A customer support bot searching internal company Notion pages before answering a user's question, preventing outdated or hallucinated info. |
| **Quiz** | *Why would a company use RAG instead of re-training their model every week?*<br>• A) It costs less and provides real-time data access.<br>• B) It makes the model memorize passwords.<br>• C) It eliminates the need for any language model.<br>*(Answer: A)* |

---

## 🏗️ Architecture & Data Pipeline

TermLens combines deterministic grounding with adaptive agentic reasoning:

```
                      ┌──────────────────────────────────────┐
                      │              User Query              │
                      └──────────────────┬───────────────────┘
                                         ▼
                      ┌──────────────────────────────────────┐
                      │         Input Guardrails             │
                      │  (Scope check & Safety validation)   │
                      └──────────────────┬───────────────────┘
                                         ▼
                                ┌─────────────────┐
                       Yes ┌────┤ In AI Glossary? ├────┐ No
                           │    └─────────────────┘    │
                           ▼                           ▼
                 ┌───────────────────┐       ┌───────────────────┐
                 │ Local Knowledge   │       │ Web Search Tool   │
                 │ (Stanford HAI DB) │       │ (Live Retrieval)  │
                 └─────────┬─────────┘       └─────────┬─────────┘
                           │                           │
                           └─────────────┬─────────────┘
                                         ▼
                      ┌──────────────────────────────────────┐
                      │           TermLens Agent             │
                      │   (LangChain + Local / Cloud LLMs)   │
                      │   - Simple Breakdown                 │
                      │   - Mental Model Synthesis           │
                      │   - Practical Real-world Example     │
                      │   - Dynamic Concept Quiz             │
                      └──────────────────┬───────────────────┘
                                         ▼
                      ┌──────────────────────────────────────┐
                      │       HITL (Human-in-the-Loop)       │
                      │    & Output Guardrails Validation    │
                      └──────────────────┬───────────────────┘
                                         ▼
                      ┌──────────────────────────────────────┐
                      │   Interactive Web UI / FastAPI Res   │
                      └──────────────────────────────────────┘
```

### Core Data & System Capabilities
* 📚 **Authoritative AI Glossary**: Grounded by curated datasets, including **98+ verified definitions from Stanford HAI** (`data/glossary.json`).
* 🤖 **Agentic Reasoning (LLMs)**: Powered by local inference (e.g. Ollama with `qwen2.5-coder`) and cloud providers (Google Gemini) via LangChain.
* 🌐 **Web Search Tooling**: Dynamically retrieves definitions and community consensus for newly emerging terms and cutting-edge papers.
* 🛡️ **Guardrails & Quality Control**: Enforces output formatting, filters non-AI queries, and verifies analogy factual accuracy.
* 👤 **Human-in-the-Loop (HITL)**: Feedback loops for rating mental model clarity, validating quiz questions, and curating new glossary additions.

---

## 🛠️ Technology Stack

* **Backend / API**:
  * [Python 3.12+](https://python.org)
  * [FastAPI](https://fastapi.tiangolo.com/) & [Pydantic v2](https://docs.pydantic.dev/)
  * [LangChain](https://www.langchain.com/) / `langchain-ollama` / `langchain-google-genai`
  * Package Management: `uv`
* **Frontend / Web**:
  * [Next.js](https://nextjs.org/) (App Router)
  * [TypeScript](https://www.typescriptlang.org/) & [React](https://react.dev/)
* **Data**:
  * Structured JSON datasets (`data/glossary.json` from Stanford University HAI)

---

## 📂 Repository Structure

```text
termlens/
├── README.md                      # Project documentation & overview
├── AGENTS.md                      # Workspace agent conventions & rules
├── data/
│   ├── glossary.json              # 98 Stanford HAI terms (array format)
│   └── glossary_with_metadata.json# Glossary with metadata & source info
├── api/                           # Backend API (FastAPI + LangChain)
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py                # FastAPI entrypoint
│   ├── code/
│   │   └── agent-01.py            # LangChain agent prototype
│   ├── data/
│   │   └── glossary.json          # Mirrored glossary data for API
│   ├── pyproject.toml             # uv / Python dependencies
│   └── uv.lock
└── web/                           # Frontend (Next.js + TypeScript)
    ├── app/                       # Next.js App Router pages
    ├── package.json
    └── tsconfig.json
```

---

## 🚀 Getting Started

### 1. Backend Setup (`api/`)

```bash
cd api

# Install dependencies using uv
uv sync

# Run the agent prototype or API server
uv run python app/main.py
```

### 2. Frontend Setup (`web/`)

```bash
cd web

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to interact with the TermLens interface.

---

## 🗺️ Roadmap

- [x] Initial Stanford HAI 98-term glossary extraction & normalization
- [x] LangChain agent foundation with local Ollama model integration
- [ ] Multi-turn mental model refinement loop
- [ ] Real-time web search fallback for unlisted terms
- [ ] Guardrails implementation for hallucination suppression
- [ ] Human-in-the-Loop curation dashboard for rating analogies & quizzes
