---
name: n8n-execution-analyst
description: >
  n8n Execution Analyst for the [Your Company] GTM stack. Use ANY TIME someone wants to
  check, monitor, audit, or investigate n8n workflow executions in the [Your Company] instance
  ([your-company].app.n8n.cloud). Triggers on: "check n8n executions", "did my workflow run",
  "why did the workflow fail", "n8n health", "what failed today", "execution log for",
  "workflow success rate", "is anything broken in n8n", "recurring failures", "which
  workflows are stalled", "run the daily n8n report", "n8n dashboard", "pull execution
  data for workflow X", "what happened in execution 1234". Pulls execution logs (active +
  inactive workflows) via the n8n Public API, extracts full node-level data + errors,
  stores every run in a queryable history, answers plain-English questions grounded in
  that data, renders an HTML dashboard, and pings the AI GTM team on failures/stalls.
  Daily-scheduled and at-will.
---

# n8n Execution Analyst

Monitors every workflow execution in [Your Company]'s n8n instance, stores full history, answers
questions about it, and alerts on failures — without inventing any data. All answers are
computed from stored execution records and cite real execution IDs.

## Setup (one time)
1. Get a valid n8n API key: n8n → **Settings → n8n API → Create an API key** (a long `eyJ...` JWT).
2. Set environment variables before any live run:
   ```bash
   export N8N_API_KEY=[YOUR_CREDENTIAL]
   export N8N_BASE_URL="https://[your-company].app.n8n.cloud"
   # optional alerting (off by default):
   export ALERT_WEBHOOK_URL="https://hooks.slack.com/services/..."
   export ALERT_DRY_RUN="false"                      # only when ready to send real alerts
   ```
3. Initialize: `python scripts/store.py`

## Routing — pick the action from the user's intent

| User says… | Do this |
|---|---|
| "pull / refresh / sync executions", "check n8n now" | `python scripts/ingest.py` (add `--full` for backfill, `--limit N` for a safe pilot) |
| "run the daily report / cycle" | `python scripts/run_daily.py` (ingest → alert check → rebuild dashboard) |
| any question about runs, failures, rates, dates, stalls, a specific execution | `python scripts/query.py "<their question>"` and relay the `answer` |
| "build / open the dashboard" | `python dashboard/build.py` then present `dashboard/index.html` |
| "alert the team / check health" | `python scripts/alert.py` (dry-run unless explicitly enabled) |
| offline demo / no key yet | add `--from-fixtures tests/fixtures` to `ingest.py`, or `--fixtures tests/fixtures` to `run_daily.py` |

After running a query script, **read the JSON it prints and answer the user in plain
language**, quoting the execution IDs / counts from the `data` field. Never state a number
that isn't in that output.

## What gets captured per execution
Workflow name + ID · execution date/time · status · mode · last node executed (where it
stopped) · per-node error message + failing node · full node run data + raw JSON (in the
`executions.raw_json` column and `node_runs` table) · stop-reason diagnosis · error category.

## Hard guardrails (do not violate)
- **Read-only n8n API.** Only GET. Never call DELETE/activate/deactivate.
- **Secrets from env only.** Never print, log, hardcode, or commit `N8N_API_KEY`.
- **No fabrication.** Absent fields are stored/returned as null. If the store has no data
  for a question, say so — never guess.
- **Alerts are dry-run by default.** Confirm with the user before setting `ALERT_DRY_RUN=false`.
- **Idempotent.** Re-running ingestion never duplicates executions (upsert on execution ID).

## Modules
`scripts/store.py` (SQLite DAL, Postgres-ready) · `scripts/parse.py` (extractor) ·
`scripts/diagnose.py` (stop-node + reason, recurring, stalls) · `scripts/ingest.py`
(n8n API client) · `scripts/query.py` (grounded NL query) · `scripts/alert.py` (notifier) ·
`dashboard/build.py` (HTML) · `scripts/run_daily.py` (orchestrator).

## Example questions this answers
- "How many times did Clay → HubSpot Sync fail today?"
- "Why did execution 1003 fail?"
- "What's our n8n success rate this week?"
- "Any recurring failures?"
- "Which active workflows have stopped running?"

## Scheduling
Wire `scripts/run_daily.py` to a daily 06:00 CT scheduled task. Safe to run any time.

See `docs/` for README, schema, and the alert runbook.