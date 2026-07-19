---
name: context-handoff
version: 1.0
owner: Diamitani Industries, Inc.
status: active
implements: "ROSTR — PAL (compiler) + ContextEngine (flat-file session memory)"
---

# Context Handoff — Session Transcript, Manifest & Next-Agent Priming

**What this skill does:** at the end of (or partway through) any agent
session, this skill turns that session into a portable, zero-infrastructure
context package — so the work can be picked up by a *different* agent,
chat, LLM, or platform with no lost context and no re-explaining.

It's a direct, generalized implementation of two components from the
**ROSTR framework** (Patrick Diamitani, *ROSTR: A Unified Architecture for
Production-Grade Multi-Agent Systems*, Zenodo, 2026 — DOI
`10.5281/zenodo.19550414`):

- **ContextEngine** — "a zero-infrastructure flat-file session memory
  layer." This skill's output is *always* plain files committed to the
  repo (Markdown + JSON) — no database, no external service, no vendor
  lock-in. Any agent with filesystem read access can resume from it.
- **PAL (Prompt Abstraction Layer)** — "a five-stage compiler that
  transforms natural language intent into structured agent runtime
  manifests." This skill runs the same shape of compiler, over a session
  instead of a single prompt (see **Process**, below), and its primary
  output is a structured **runtime manifest** (`context-manifest.json`),
  not just prose.

## When to use this skill

- You're closing out a work session and the next step might happen in a
  different agent, a different chat, or a different platform entirely.
- A human asks for "a transcript," "a handoff doc," "context to transfer,"
  or "a prompt for the next agent."
- A project is being paused and needs to be resumable by anyone, later,
  without access to this conversation.

## Process (the five compiler stages)

1. **Collect.** Gather the raw session material: the user's actual
   messages (verbatim — never paraphrase the ask itself), every file
   created or changed (with paths), every external fact gathered (with
   sources/URLs), every decision made and why, every test run and its
   result, and every commit/PR produced (with real SHAs and URLs).
2. **Compile.** Distill the collected material into a structured
   **runtime manifest** — a JSON document with a fixed shape (schema
   below) covering repo state, completed work, open items, hard
   constraints/rules the next agent must not violate, and links. This is
   the PAL step: natural-language session → structured manifest.
3. **Narrate.** Render the full session as a flat-file **transcript**
   (`TRANSCRIPT.md`) — chronological, readable by a human or an agent,
   quoting user requests verbatim and summarizing actions faithfully. This
   is the ContextEngine step: durable, flat-file, no infrastructure.
4. **Prime.** Generate a paste-ready **next-agent prompt** — short enough
   to open a new session with, pointing at the manifest and transcript for
   depth, and stating explicitly what's done vs. pending.
5. **Route.** Generate a set of **next-step prompts** — one per concrete
   next action, ready to paste into a fresh agent session with no further
   editing required. If the *pattern itself* (not just this session's
   content) is generalizable, also emit a **prompt-library one-sheeter**
   so a different person on a different project can reuse the pattern.

## Hard rules

- **Verbatim where verbatim is claimed.** If a document says it contains
  a user's message "verbatim," it must be an exact quote — no cleanup, no
  paraphrase. Where true tool-call-level logs aren't available to quote
  verbatim, say so explicitly rather than presenting a reconstruction as
  a raw log.
- **Every link is real.** PR URLs, commit SHAs, file paths — never
  invented, always checked against the actual repo/remote at write time.
- **Flat files only.** No database, no external memory service. Everything
  lives in the repo under version control, per ContextEngine's
  "zero-infrastructure" principle.
- **Self-contained.** A new agent should be able to resume work having
  read only `context-manifest.json` + `TRANSCRIPT.md` — not this
  conversation.
- **Idempotent-ish.** Re-running this skill later in the same project
  should update/extend the existing manifest and transcript rather than
  silently duplicating them.

## Output schema — `context-manifest.json` (the PAL runtime manifest)

```json
{
  "generatedBy": "context-handoff v1",
  "generatedAt": "ISO-8601 timestamp",
  "project": { "repo": "org/name", "branch": "...", "baseBranch": "..." },
  "session": {
    "summary": "One paragraph, what this session did and why.",
    "userRequests": ["Verbatim quotes of each distinct user ask this session."]
  },
  "completedWork": [
    { "area": "...", "details": "...", "files": ["..."], "commits": ["sha"] }
  ],
  "openItems": [
    { "id": "...", "description": "...", "priority": "high|medium|low" }
  ],
  "hardConstraints": ["Rules the next agent must not violate, verbatim from source skills/docs."],
  "links": { "pr": "url", "commits": ["sha: message"], "docs": ["path"] }
}
```

## Where this is wired in

- Session output for any given engagement: `handoff/` at the repo root —
  `TRANSCRIPT.md`, `context-manifest.json`, `NEXT_AGENT_PROMPT.md`,
  `NEXT_STEPS_PROMPTS.md`.
- The generalized, reusable pattern (for other people, other projects):
  `prompts/context-handoff-one-sheet.md`, indexed in `prompts/README.md` —
  Diamitani Industries' prompt library.
- Related skill in this same repo: `skills/catalog-track-critic/SKILL.md`
  (same authoring conventions — confidence flags, no fabrication, flat
  output files).
