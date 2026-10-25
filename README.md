# 🎓 TermLens (School Edition)

> **AI Term Explainer for School Students**  
> *Deconstructing machine learning concepts into intuitive, sticky mental models, 3-step walk-throughs, and AI-graded recall.*

---

## 🌟 What is TermLens?

**TermLens** is an intelligent AI concept tutor designed specifically for school students. Traditional AI glossaries are either too academic or overly superficial. TermLens breaks down any AI term into a beginner-friendly **4-Layer Cognitive Breakdown**:

1. 🎯 **Simple (ELI5)**: Exactly one clear sentence a middle- or high-school student understands without jargon.
2. 🧠 **Mental Model + 3 Steps**: An everyday comparison (school, library, kitchen, sports, smartphone) paired with **exactly 3 sequential steps** explaining how it works.
3. 💡 **Relatable Real-World Example**: A concrete scenario students can relate to (homework bots, video games, classroom tools).
4. ❓ **Active Recall Quiz (0–3 AI Grading)**: An interactive question graded on a **0–3 rubric** with encouraging, constructive pedagogical feedback.

---

## 🏗️ Architecture & Technology Stack

```
                          ┌───────────────────────────┐
                          │   Student Web Interface   │
                          │   (Next.js + Tailwind +   │
                          │      Claymorphism UI)     │
                          └─────────────┬─────────────┘
                                        │ SSE / JSON
                                        ▼
                          ┌───────────────────────────┐
                          │    FastAPI Server (uv)    │
                          │   - School-Safe Filter    │
                          │   - PII Redaction         │
                          │   - Injection Guardrails  │
                          │   - Rate Limiter          │
                          └─────────────┬─────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
        ┌───────────────────────┐               ┌───────────────────────┐
        │  Stanford HAI Glossary│               │   Safe Web Search     │
        │   (data/glossary.json)│               │   (Teacher HITL Gate) │
        └───────────┬───────────┘               └───────────┬───────────┘
                    │                                       │
                    └───────────────────┬───────────────────┘
                                        ▼
                          ┌───────────────────────────┐
                          │   LangChain create_agent  │
                          │   - 4-Layer Structured    │
                          │   - 0-3 Quiz Grader       │
                          │   - Local Ollama / Fake   │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │   SQLModel SQLite DB      │
                          │   - XP & Levels           │
                          │   - Streaks & Freezes     │
                          │   - Daily Goals & Badges  │
                          │   - History & Reviews     │
                          └───────────────────────────┘
```

* **Backend (`api/`)**:
  * [FastAPI](https://fastapi.tiangolo.com/) with SSE streaming (`sse-starlette`)
  * [LangChain](https://docs.langchain.com/) `create_agent` with structured Pydantic output
  * [SQLModel](https://sqlmodel.tiangolo.com/) + SQLite (`termlens.db`)
  * Local Ollama (`qwen2.5-coder:14b`, `qwen2.5:1.5b`) & offline `GenericFakeChatModel` for tests
  * Dev runner: `uv run fastapi dev app/main.py`
* **Frontend (`web/`)**:
  * [Next.js](https://nextjs.org/) (App Router) + [Tailwind CSS](https://tailwindcss.com/)
  * Claymorphic aesthetic: soft lavender base (`#F4EFFC`), violet primary (`#6B42FD`), peach/mint/sunflower accents, pillowy cards, strictly zero emoji (bespoke inline SVGs)
  * Dev runner: `npm run dev`
* **Knowledge Base (`data/`)**:
  * 98 curated AI definitions directly from [Stanford HAI (Human-Centered AI)](https://hai.stanford.edu/ai-definitions)

---

## 🛡️ Guardrails & Safety Architecture

Designed from the ground up for school safety and academic integrity:

| Guardrail | Enforcement Method | Behavior |
| :--- | :--- | :--- |
| **School-Safe Filter** | Keyword regex & semantic checks | Blocks profanity, violence, adult topics, and illegal substances. |
| **Anti-Prompt Injection** | Jailbreak pattern detection | Neutralizes attempts to override system prompts or bypass filters. |
| **PII Redaction** | Automatic pattern masking | Redacts emails, phone numbers, SSNs, and credit cards before LLM processing. |
| **Rate Limiter** | In-memory sliding window | Restricts excessive requests (25 req/min) to avoid abuse. |
| **Execution Bounds** | Bounded iterations & query limits | Caps tool execution to max 3 iterations and term length to 150 chars. |
| **Teacher HITL Approval** | Human-in-the-Loop review gate | Unlisted terms requiring web search are held until approved by a curator. |

---

## 🎮 Engagement & Gamification

* **XP & Levels**: Earn XP for exploring terms (+15 XP), hitting daily goals (+25 XP), and mastering quizzes (+5 to +35 XP). Every 100 XP levels up!
* **Daily Streaks**: Habit tracker rewarding daily practice.
* **Streak Freezes**: Prevent streak resets when life happens! Students can purchase streak freezes using their earned credits.
* **Daily Goal**: Set to 3 concepts/day with celebratory bonus rewards.
* **Earned Badges**: Milestone badges (`First Spark`, `Concept Explorer`, `Three-Day Fire`, `Mastery Ace`, `Curator Ally`).
* **Study History**: Preserves a full log of terms, analogies, and quiz attempts in SQLite.

---

## 🚀 Running the Project

### 1. Run Backend (`api/`)

```bash
cd api

# Install dependencies via uv
uv sync

# Run FastAPI in development mode
uv run fastapi dev app/main.py --port 8000
```

FastAPI will start at `http://127.0.0.1:8000` with interactive Swagger docs at `http://127.0.0.1:8000/docs`.

### 2. Run Test Suite (Offline with Fake Model)

```bash
cd api
uv run pytest
```

*Runs 20 automated unit tests covering guardrails, PII redaction, prompt injection, agent structured output, 0–3 quiz grading, and all FastAPI endpoints!*

### 3. Run Frontend (`web/`)

```bash
cd web

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to interact with the full claymorphic experience.

---

## 📦 Deliverable Archive

* Full source package: **[termlens-school-edition.zip](file:///Users/hamza/Hami%20Projects/navttc/termlens/termlens-school-edition.zip)**
* Core Agent Code: **[api/app/main.py](file:///Users/hamza/Hami%20Projects/navttc/termlens/api/app/main.py)**
* Stanford HAI AI Glossary: **[data/glossary.json](file:///Users/hamza/Hami%20Projects/navttc/termlens/data/glossary.json)**
