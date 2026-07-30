# MSA DocuSign Automation

> CRM deal to submitted DocuSign contract in under 3 minutes.

## What It Does
Automates the full contract signing workflow. Reads deal data from CRM, populates the contract template, creates a DocuSign envelope, routes for signatures, tracks completion status, and writes back to CRM on close.

## Use Cases
- Trigger contract signing from a CRM deal stage
- Auto-populate MSA template with deal data
- Track DocuSign envelope status
- Update CRM on contract completion

## Tech Stack
- DocuSign API
- HubSpot CRM
- n8n
- Contract Templates

## Trigger Phrases
- "send the MSA"
- "trigger DocuSign"
- "automate contract signing"
- "send contract for [company]"

## Setup
Requires `[YOUR_DOCUSIGN_ACCOUNT_ID]`, `[YOUR_DOCUSIGN_TEMPLATE_ID]`, and `[YOUR_CRM_API_KEY]`.

## Notes
v1 · live · originally built after two vendor API limitations — uses constraint-driven architecture
