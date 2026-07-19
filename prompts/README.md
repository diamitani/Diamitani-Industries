# Prompt Library — Diamitani Industries

A small, growing collection of reusable "prompt cards" — one page each,
copy-paste-ready, generalized beyond any single project. Each card names
the pattern it implements (often a component of the
[ROSTR framework](https://zenodo.org/records/19550414)) and points at a
matching skill under `skills/` for the full process definition.

## Index

| Card | Use it when | Skill |
|------|-------------|-------|
| [`context-handoff-one-sheet.md`](./context-handoff-one-sheet.md) | You're wrapping up a session and need the work to be fully resumable by a different agent, chat, or platform. | [`skills/context-handoff/SKILL.md`](../skills/context-handoff/SKILL.md) |

## Conventions for adding a new card

- One Markdown file per card, named `<kebab-case-name>.md`.
- Structure: **Use this when** → **The prompt** (a single, self-contained,
  copy-paste code block) → **What you get**.
- If the card is a generalization of something built in this repo for a
  specific purpose, link the matching `skills/*/SKILL.md` for the full
  process/schema — the card should stay short; the skill can be long.
- Add a row to the Index table above.
