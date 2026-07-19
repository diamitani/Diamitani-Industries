# Prompt Card: Context Handoff — Session → Transcript, Manifest & Next-Agent Priming

**Category:** Agent ops / continuity
**Implements:** ROSTR — PAL (Prompt Abstraction Layer) + ContextEngine (flat-file session memory)
**Skill file:** `skills/context-handoff/SKILL.md`
**Author:** Patrick Diamitani / Diamitani Industries, Inc.

## Use this when

You're wrapping up (or pausing) work in one agent/chat/LLM/platform and
need the work to be *fully* resumable somewhere else — a different agent,
a different chat window, a teammate, or your future self in three weeks —
with zero re-explaining and zero lost context.

## The prompt

Paste this into your current agent session:

```
Act as the context-handoff skill. Produce a portable, zero-infrastructure
context package for this session so it can be resumed by a different
agent, chat, or platform. Create these files (adjust the folder if this
repo already has a convention):

  handoff/TRANSCRIPT.md
    A chronological, flat-file session record. Quote my actual messages
    verbatim (typos and all — don't clean them up). Faithfully describe
    every file you created/changed, every external fact you gathered (with
    real sources/URLs), every decision and why, every test you ran and its
    result, and every commit/PR you produced (real SHAs/URLs only — never
    invent one). If you can't produce something as a literal verbatim log
    (e.g. raw tool-call traces), say so explicitly rather than presenting a
    reconstruction as if it were one.

  handoff/context-manifest.json
    A structured runtime manifest — not prose — covering: project/repo
    state, a one-paragraph summary, my verbatim requests, completed work
    (with file paths and commit references), open items (prioritized),
    hard constraints the next agent must not violate, and a links block
    (PR, commits, docs, external sources used). This is the PAL step:
    compile the natural-language session into a structured manifest.

  handoff/NEXT_AGENT_PROMPT.md
    A short, paste-ready prompt for opening a brand new agent session on
    this same work — it should point at the manifest + transcript for
    depth rather than repeating their content, state current
    branch/PR/repo, and list the hard constraints inline so they can't be
    missed.

  handoff/NEXT_STEPS_PROMPTS.md
    One ready-to-paste prompt per open item from the manifest — each
    fully self-contained, no further editing required before pasting into
    a fresh session.

Hard rules: every link/SHA/path must be real and checked, not invented.
Everything must be flat files committed to the repo — no external database
or memory service. A new agent must be able to resume having read only the
manifest + transcript, not this conversation.
```

## What you get

- A complete, honest record of the session (not a marketing summary).
- A machine-readable manifest a *tool* could also parse, not just a human.
- Zero setup cost for whoever picks this up next — it's just files in the
  repo they already have.

## Generalize it further (optional)

If the pattern itself — not just this session's content — is worth reusing
on other projects, also ask for:

```
Now generalize this into a reusable prompt-library entry: a one-page
"prompt card" (name, category, use-case, the exact prompt text, what you
get) that someone on a completely different project could copy-paste
verbatim. Save it as prompts/context-handoff-one-sheet.md and index it in
prompts/README.md.
```

(That's exactly how this file came to exist.)

## Notes on the ROSTR alignment

This pattern is a direct generalization of two named components from the
ROSTR framework (Patrick Diamitani, *ROSTR: A Unified Architecture for
Production-Grade Multi-Agent Systems*, Zenodo, DOI `10.5281/zenodo.19550414`):

- **PAL** is defined there as "a five-stage compiler that transforms
  natural language intent into structured agent runtime manifests" — this
  card's manifest output is exactly that, applied to a whole session
  instead of a single prompt.
- **ContextEngine** is defined there as "a zero-infrastructure flat-file
  session memory layer" — this card's output is always plain committed
  files, never a database or external service.

See `skills/context-handoff/SKILL.md` for the full process definition
(the actual "five stages": Collect → Compile → Narrate → Prime → Route).
