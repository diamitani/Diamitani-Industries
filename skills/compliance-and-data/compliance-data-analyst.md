# Compliance Data Analyst

> Analyzes compliance tracking data from CSV exports or workflow runs — read-only.

## What It Does
Read-only compliance analyst. Takes exported compliance tracking CSVs or n8n workflow execution outputs and produces structured reports: coverage totals, status change summaries, timestamp coverage, and missing data flags. Never modifies source data.

## Use Cases
- Generate a compliance coverage report
- Detect status changes since last baseline
- Flag entities missing required compliance data
- Validate a workflow's output against expected coverage

## Tech Stack
- Python
- CSV Processing
- n8n
- Reporting

## Trigger Phrases
- "analyze compliance data"
- "compliance coverage report"
- "show readiness status"
- "compliance baseline report"

## Setup
Point the skill at your compliance tracking CSV or n8n execution URL. Configure `[YOUR_WORKFLOW_ID]` and `[YOUR_TABLE_ID]` for the execution analysis mode.

## Notes
v1 · live · generalized from production. Original tracked 160+ country EOR readiness.
