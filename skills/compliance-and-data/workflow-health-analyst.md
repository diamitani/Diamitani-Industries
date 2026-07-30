# Workflow Health Analyst

> Inspects n8n workflow execution for success, errors, delivery completion, and activation state.

## What It Does
Post-run validation skill for n8n workflows. Inspects execution logs for success/error status at each node, checks data pull health from source systems, validates delivery completion, and confirms activation state before marking safe to deploy.

## Use Cases
- Validate a workflow run after execution
- Triage node-level errors in a failed run
- Confirm data delivery to downstream systems
- Check if a workflow is safe to promote to production

## Tech Stack
- n8n API
- Python
- Execution Analysis
- Monitoring

## Trigger Phrases
- "check this workflow run"
- "validate execution health"
- "did the workflow complete successfully"
- "post-run check"

## Setup
Configure `[YOUR_N8N_API_KEY]` and `[YOUR_WORKFLOW_ID]`. Point at the specific execution to inspect.

## Notes
v1 · live · generalized from production
