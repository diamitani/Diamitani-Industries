---
name: context-engine
description: >
  Persistent session memory layer for Claude. Use this skill ANY TIME someone wants to:
  save what happened in a session, cache session activity, log progress, retrieve past context,
  generate a progress or troubleshooting report, do a "context flash" (load last session summary),
  or run a scheduled memory report. ALWAYS trigger on: "save this session", "cache what we did",
  "log our progress", "what did we work on last time", "context flash", "load context",
  "what have we been building", "generate a progress report", "troubleshooting log", "session summary",
  "memory report", "what's our current state", "recap what worked", or any request to persist, retrieve,
  or report on past session activity. This skill turns ephemeral Claude sessions into a searchable,
  compressed, indexed memory layer that survives across conversations.
---

# ContextEngine — Persistent Session Memory Layer

A self-managing memory system that auto-caches, compresses, indexes, and retrieves session activity across conversations. Turns ephemeral Claude sessions into a durable, queryable knowledge base.

---

## Storage Layout

All state lives in `.context-engine/` relative to the active workspace root:

```
.context-engine/
├── sessions/           # Raw session summaries (one .json per session)
├── index/
│   └── master.jsonl    # Appended log of all compressed session records
├── reports/            # Generated reports (markdown files)
├── cache/
│   └── last.json       # Most recent context snapshot (quick load)
└── CONTEXT.md          # Running human-readable state document
```

Create this structure on first use if it doesn't exist:
```bash
mkdir -p .context-engine/sessions .context-engine/index .context-engine/reports .context-engine/cache
```

---

## Session Record Schema

Every cached session compresses to this JSON structure:

```json
{
  "session_id": "YYYYMMDD_HHMMSS",
  "date": "ISO 8601 timestamp",
  "project": "project or workspace name",
  "duration_estimate": "short | medium | long",
  "summary": "2-3 sentence narrative of what happened",
  "tools_used": ["bash", "edit", "write", "..."],
  "files_created": [],
  "files_modified": [],
  "skills_invoked": [],
  "what_worked": ["bullet list of wins"],
  "what_failed": ["bullet list of failures, errors, dead ends"],
  "decisions_made": ["key choices made and why"],
  "open_questions": ["unresolved items"],
  "next_steps": ["recommended next actions"],
  "tags": ["topic", "tool", "workflow"],
  "blockers": ["anything that blocked progress"]
}
```

---

## Modes

### 1. CACHE — Save Session Context

Triggered when the user says: "save this session", "cache what we did", "log progress", or at natural session end. Also triggered automatically by the scheduled memory report every 60 minutes.

Steps:
1. Review the current conversation to extract session facts
2. Populate the session record schema above — infer what you can, ask only if critical fields are ambiguous
3. Generate a `session_id` using current timestamp
4. Write to `.context-engine/sessions/{session_id}.json`
5. Append the compressed record to `.context-engine/index/master.jsonl`
6. Write the session summary to `.context-engine/cache/last.json` (overwrite)
7. Update `.context-engine/CONTEXT.md` — see CONTEXT.md format below
8. Confirm to the user: "Session cached. {N} total sessions in index."

### 2. RETRIEVE — Context Flash (Load Last Session)

Triggered when the user says: "what did we work on", "context flash", "load context", "catch me up", "what's our current state".

Steps:
1. Read `.context-engine/cache/last.json`
2. Also read the last 3–5 records from `.context-engine/index/master.jsonl` for trend context
3. Surface a clean, scannable recap:
   - **Last session:** date, summary, what worked, what failed, next steps
   - **Pattern across recent sessions:** any recurring blockers or themes
   - **Recommended starting point:** top open item or next step

### 3. REPORT — Generate Progress Report

Triggered when the user says: "generate a report", "progress report", "troubleshooting log", "what have we been building", "weekly summary".

Steps:
1. Read all records from `.context-engine/index/master.jsonl`
2. Filter by optional parameters the user provides (date range, tags, project)
3. Generate a structured markdown report — see Report Format below
4. Save to `.context-engine/reports/{date}_{type}_report.md`
5. Link the file for the user to download

### 4. QUERY — Search the Index

Triggered when the user asks about specific past events: "when did we fix the Clay webhook", "what was the issue with n8n last week", "find all sessions tagged hubspot".

Steps:
1. Read `.context-engine/index/master.jsonl`
2. Filter/search by: tags, date, keywords in summary/what_worked/what_failed, tools_used
3. Return matching sessions in a scannable format with key facts surfaced
4. Offer to expand any specific session

### 5. SCHEDULE — Set Up Periodic Reports

Triggered when the user says: "schedule a weekly report", "auto-report every Friday", "set up daily summaries".

Steps:
1. Confirm: frequency (daily, weekly), report type (progress, troubleshooting, full), delivery format
2. Use the `schedule` skill to create the recurring task
3. The scheduled prompt should be: "Run context-engine report mode for the past [N] days and save to .context-engine/reports/"
4. Confirm schedule is set and what it will produce

---

## CONTEXT.md Format

This is the always-current human-readable state doc. Overwrite it on every CACHE operation.

```markdown
# Project Context — Last Updated: {date}

## Current State
{2-3 sentences on where the project stands right now}

## What's Working
{bullet list from recent sessions: confirmed wins}

## Active Blockers
{bullet list of unresolved issues}

## Open Next Steps
{prioritized list of recommended next actions}

## Recent Session Log
| Date | Summary | Result |
|------|---------|--------|
| {date} | {one-line summary} | ✅ / ⚠️ / ❌ |
| ... | ... | ... |

## Tags in Use
{comma-separated list of all tags seen across sessions}
```

---

## Report Format

```markdown
# ContextEngine Report — {type} — {date range}

## Executive Summary
{3-5 sentence narrative of the period}

## Progress Highlights
{what shipped, what was solved, what advanced}

## Troubleshooting Log
{failures, errors, dead ends — grouped by tool or workflow}

## Decisions Made
{key choices and their rationale}

## Open Items
{ranked list of unresolved questions and next steps}

## Session Timeline
| Date | Summary | Tags | Result |
|------|---------|------|--------|
| ... | ... | ... | ✅ / ⚠️ / ❌ |

## Patterns Observed
{recurring themes, tools causing repeated friction, workflows that keep coming up}
```

---

## Behavior Rules

- Always infer session content from conversation history before asking the user to fill in blanks
- Keep the `summary` field to 2–3 tight sentences — no bloat
- Tags should be lowercase, consistent, reusable across sessions (e.g., `n8n`, `hubspot`, `clay`, `outreach`, `amplemarket`, `rfp`, `skill-build`)
- When writing `what_failed`, be specific — "HTTP 401 on HubSpot auth endpoint" not "authentication issue"
- CONTEXT.md should always be writable by a non-technical user and scannable in under 60 seconds
- On RETRIEVE, lead with the most actionable thing — what to do next, not just what happened
- Never overwrite or delete session files — the index is append-only; corrections go in a new session record

---

## Quick Reference

| User says... | Mode triggered |
|---|---|
| "save this session" / "cache what we did" | CACHE |
| "context flash" / "what did we work on" | RETRIEVE |
| "generate a report" / "progress report" | REPORT |
| "find when we fixed X" / "search sessions for..." | QUERY |
| "schedule weekly report" | SCHEDULE |