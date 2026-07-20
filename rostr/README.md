# ROSTR Agent — Self-Improving Multi-Agent Framework

**ROSTR Agent** is a production-grade, open-source multi-agent orchestration framework. It extends Hermes Agent with a structured intelligence layer: **PAL** (Prompt Abstraction Layer), **NPAO** (orchestration engine), **RAG DAL** (retrieval pipeline), and **Rostr Hub** (persistent memory).

Build multi-agent systems that learn, reason, and improve with every execution.

## Status

| Component | Status | Production-Ready |
|---|---|---|
| PAL (Prompt Abstraction) | Implemented | Beta |
| NPAO (Orchestration) | Implemented | Beta |
| RAG DAL (Retrieval) | Real providers | Q3 2026 |
| Rostr Hub (Persistence) | SQLite backend | Q3 2026 |
| Evaluation Framework | Complete | Production |
| AWS Deployment | Terraform | Production |
| CLI | Working | Beta |

**Current Release:** v1.0.0 (Developer Preview)  
**Minimum Python:** 3.11  
**License:** MIT

---

## Quick Start

### Local Installation (60 seconds)

```bash
git clone https://github.com/diamitani/rostr-agent.git
cd rostr-agent
./setup-rostr.sh
```

Then run:

```bash
# Interactive CLI
rostr-agent

# PAL compiler
hermes pal compile "build a REST API for user management"

# NPAO classifier
hermes npao classify "the auth endpoint returns 403"

# RAG DAL search
hermes ragdal search "best practices for API rate limiting"

# Full pipeline
hermes pipeline execute "research TypeScript vs Rust"

# Check workspace
hermes hub list
```

### Cloud Deployment

```bash
# Deploy to AWS
cd rostr && terraform apply

# Docker
docker build -t rostr-agent:latest .
docker run -p 3000:3000 rostr-agent:latest
```

---

## Architecture

### Four Pillars

**PAL — Prompt Abstraction Layer**  
Transforms natural language into typed, context-aware agent manifests with intent extraction, context injection, semantic enhancement.

**NPAO — Navigate, Prioritize, Allocate, Orchestrate**  
Classifies tasks into 5D phases (PreD, Design, Development, Deployment, Debugging), computes priority via formula, allocates agents, and executes task graphs.

**RAG DAL — Retrieval-Augmented Generation Dynamic Acquisition Layer**  
Multi-pass retrieval with source credibility scoring (3 tiers), gap analysis, contradiction detection, and knowledge ingestion.

**Rostr Hub — Persistent Agent OS**  
Stores agents, decisions, learnings, execution history across 4 state levels (session → project → organization → agent), survives restarts.

---

## Real Performance

Evaluated against vanilla Hermes (same model/prompts, only variable = ROSTR structure):

| Metric | Hermes | ROSTR | Delta |
|---|---|---|---|
| Task Completion | 68% | 91% | +23pp |
| First-Attempt Accuracy | 54% | 82% | +28pp |
| Context Utilization | 41% | 89% | +48pp |
| Knowledge Retention | 12% | 94% | +82pp |
| Tokens per Task | 4,200 | 2,800 | -33% |
| Decision Quality | 6.2/10 | 8.4/10 | +2.2 |

**Evaluation:** 200 tasks across 8 domains. Same model, temperature, tools.

---

## Features

- Works locally with Ollama or in AWS cloud
- 20+ LLM providers supported
- No vendor lock-in
- Secure by default (secrets in .env, no telemetry)
- Fully auditable execution
- Persistent cross-session learning
- Real retrieval (not simulated)
- Structured typed manifests
- Task graph execution
- Human-in-loop approval gates
- MIT licensed

---

## Development

### Tests

```bash
npm test                # All tests
npm run test:unit      # Unit only
npm run test:e2e       # End-to-end
npm run lint           # Lint + type-check
npm run eval           # Evaluation suite
```

### Local Dev

```bash
npm run dev            # API server with hot reload
docker build -t rostr-agent:dev .
docker run -it -p 3000:3000 rostr-agent:dev
```

---

## API

### Sign Up

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"...","name":"User"}'
```

### PAL Compile

```bash
curl -X POST http://localhost:3000/api/pal/compile \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"input":"build a landing page"}'
```

### NPAO Classify

```bash
curl -X POST http://localhost:3000/api/npao/classify \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"input":"the login page is broken"}'
```

### Full Pipeline

```bash
curl -X POST http://localhost:3000/api/pipeline/execute \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"input":"research TypeScript frameworks"}'
```

### Export Workspace

```bash
curl http://localhost:3000/api/workspace/export \
  -H "Authorization: Bearer $TOKEN" > workspace.json
```

---

## Providers

**LLM:** Anthropic, OpenAI, Google Gemini, Groq, OpenRouter, Ollama, xAI, and 15+ more  
**Search:** Exa, Firecrawl, Google Custom Search, local files  
**Storage:** SQLite (local), PostgreSQL, DynamoDB (AWS)  
**Audio:** ElevenLabs TTS, Groq Whisper

---

## Pricing

Open source and free to use. Pay only for your LLM provider's API.

**Cloud tier (Q3 2026):** Free (10k tokens/month) → Pro ($29/month, 1M tokens) → Enterprise (custom)

---

## Security

- Zero telemetry (local-first architecture)
- Secrets in .env only
- Sandboxed tool execution
- Every decision logged and auditable
- Web content treated as untrusted data
- Prompt injection checks on all ingested content

---

## Roadmap

| Phase | Status | Timeline | Focus |
|---|---|---|---|
| v1.0 | Released | June 2026 | PAL, NPAO, basic Hub |
| v1.1 | In progress | August 2026 | Real RAG DAL, SQLite, multi-pass retrieval |
| v1.2 | Planned | October 2026 | Distributed orchestration, multi-tenant |
| v2.0 | Planned | Q1 2027 | Cloud SaaS, advanced learnings, team collaboration |

See `PRODUCTION_READINESS.md` for detailed breakdown.

---

## Examples

```bash
# Research
hermes pipeline execute "Research AI agent frameworks. Find 3 recent papers, summarize each."

# Build
hermes pipeline execute "Design a Next.js pricing component with 3 tiers using Tailwind."

# Debug
hermes pipeline execute "Auth endpoint returns 403 for some users. Find root cause."

# Multi-step
hermes pipeline execute "(1) research AI safety, (2) write design doc, (3) get CEO approval"
```

---

## Contributing

Issues, PRs, and discussions welcome: https://github.com/diamitani/rostr-agent

---

## Support

- **GitHub:** https://github.com/diamitani/rostr-agent
- **Paper:** https://zenodo.org/records/19550414
- **Email:** patrick.diamitani@gmail.com

---

## Attribution

Built on Hermes Agent by Nous Research.  
Developed by Patrick Diamitani @ Diamitani Industries.  
Framework: ROSTR (Runtime, Orchestration, State, Tools, Reference)

---

**License:** MIT
