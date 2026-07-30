---
name: hubspot-chatbot-manager
description: >
  Manages "AI Assistant" — the [Your Company] HubSpot Customer Agent chatbot on [yourcompany.com].
  Handles: chatflow config, inbox settings, knowledge base updates, guardrails, MQL scoring,
  lead routing, HubSpot contact creation, Azure Function integration, and Azure AI Search.
  Use when Patrick says anything about: AI Chatbot, chatbot, chat flow, inbox, knowledge base,
  guardrails, lead routing, MQL, contact creation, Azure AI Search, country data, or chatbot launch.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - WebFetch
  - WebSearch
  - AskUserQuestion
---

# AI Assistant — HubSpot Chatbot Manager

**Project:** [Your Company] Customer AI Agent Pilot ("AI Chatbot")
**Agent:** AI Assistant (HubSpot Customer Agent)
**Pilot target:** https://www.[yourcompany.com]/pricing → country pages

Credentials at: `~/.claude/skills/hubspot-chatbot-manager/.env`
API helper at: `~/.claude/skills/hubspot-chatbot-manager/scripts/hs-api.sh`

---

## Known Resource IDs

| Resource | ID / URL |
|---|---|
| HubSpot Portal | `[YOUR_PORTAL_ID]` |
| Chatflow ID | `86381848` |
| Inbox ID | `10607506765` |
| Customer Agent | https://app.hubspot.com/customer-agent/[YOUR_PORTAL_ID] |
| Chatflow Editor | https://app.hubspot.com/chatflows/[YOUR_PORTAL_ID]/edit/live-chat/86381848/build |
| Inbox | https://app.hubspot.com/live-messages/[YOUR_PORTAL_ID]/inbox/10607506765 |
| Agent Tester | https://app.hubspot.com/customer-agent-tester/[YOUR_PORTAL_ID] |
| Country Data API | https://atlas-country-data-action.azurewebsites.net/api/country-data |
| Knowledge Search API | https://atlas-country-data-action.azurewebsites.net/api/knowledge-snippet-search |
| Pilot Page | https://www.[yourcompany.com]/pricing |

---

## Step 0 — Load Credentials

Every bash block that calls the API must start with:
```bash
source ~/.claude/skills/hubspot-chatbot-manager/scripts/hs-api.sh
```

Verify connection:
```bash
source ~/.claude/skills/hubspot-chatbot-manager/scripts/hs-api.sh
hs_get "/conversations/v3/chatflows/86381848" | python3 -m json.tool | head -40
```

---

## Step 1 — Inspect Current AI Chatbot Config

Full state snapshot:

```bash
source ~/.claude/skills/hubspot-chatbot-manager/scripts/hs-api.sh

echo "=== CHATFLOW 86381848 ==="
hs_get "/conversations/v3/chatflows/86381848" | python3 -m json.tool

echo "=== INBOX 10607506765 ==="
hs_get "/conversations/v3/inboxes/10607506765" | python3 -m json.tool
```

---

## Core Capabilities

### 1. Update Chatflow Configuration

Modify AI Chatbot's chatflow settings (enable/disable, targeting URL, display behavior):

```bash
source ~/.claude/skills/hubspot-chatbot-manager/scripts/hs-api.sh

# Enable / disable
hs_patch "/conversations/v3/chatflows/86381848" '{"enabled": true}'

# Update target URL (e.g. add country pages)
hs_patch "/conversations/v3/chatflows/86381848" '{
  "targeting": {
    "pages": {
      "type": "URL_CONTAINS",
      "value": "[yourcompany.com]/pricing"
    }
  }
}'
```

Current chatflow settings (from setup notes):
- Welcome Message: "Welcome to [Your Company]. I'm here to help with global hiring, payroll, and compliance questions, and to connect you with the right expert when needed."
- Email Capture: AI asks for email when sending conversation to a team member
- Target URL: https://[yourcompany.com]/pricing
- Visitor Behavior: Show when visitor is unknown and a client
- Language: English
- 24/7 working hours

---

### 2. Update Knowledge Base URLs

Per 4.9.26 update: remove old knowledge base, use these approved URLs only:

```
https://www.[yourcompany.com]/pricing
https://www.[yourcompany.com]/countries/
https://www.[yourcompany.com]/employer-of-record-eor
https://www.[yourcompany.com]/eor-payroll
https://www.[yourcompany.com]/employee-benefits-administration
```

Knowledge base updates are done via HubSpot UI (Customer Agent → Knowledge section) or via API:

```bash
source ~/.claude/skills/hubspot-chatbot-manager/scripts/hs-api.sh

# List current knowledge sources
hs_get "/customer-agent/v1/portals/$HUBSPOT_PORTAL_ID/knowledge-sources" | python3 -m json.tool

# Add a URL as knowledge source
hs_post "/customer-agent/v1/portals/$HUBSPOT_PORTAL_ID/knowledge-sources" '{
  "sourceType": "URL",
  "sourceUrl": "https://www.[yourcompany.com]/pricing"
}'
```

If the API doesn't support programmatic KB management, direct Patrick to:
→ HubSpot → Contacts → Inbox & Chat → Customer Agents → Edit AI Chatbot → Knowledge

---

### 3. Update Guidelines / System Prompt

AI Chatbot's guardrails and behavior guidelines (managed in Customer Agent settings):

**Active guardrails (per 4.9.26 and design doc):**

1. **Pricing** — Never quote exact figures. Route to sales with qualifying questions.
   - Response: *"Pricing at [Your Company] is tailored to your situation — depends on countries and headcount. Which countries are you hiring in, and roughly how many people?"*

2. **Sanctioned countries** — Explicitly decline, no workarounds.
   - Countries: Russia, Belarus, Cuba, Iran, North Korea, Syria, Venezuela (some sectors), Myanmar, Sudan & South Sudan, Somalia, Yemen, Libya, CAR, DRC, Mali, Nicaragua, Eritrea, Zimbabwe (some sectors)
   - Response: *"Unfortunately, [Your Company] is unable to support hiring in [country] due to international sanctions and regulatory restrictions."*

3. **Competitors** — Never name Deel, Remote, Rippling.
   - Redirect: *"I'm focused on helping you understand what [Your Company] can do for you."*

4. **Legal/tax advice** — Deflect to specialists.

5. **Sources** — Never expose knowledge base names, Azure Search, or uploaded files.

6. **[Your Company] "HXM" branding** — Never lapse or abbreviate incorrectly.

7. **Fallback** — Never say "I don't know." Always bridge to human handoff.
   - *"That's a great question — I want to make sure you get an accurate answer. Let me connect you with someone from our team. What's the best email to reach you?"*

To update guidelines via API:
```bash
source ~/.claude/skills/hubspot-chatbot-manager/scripts/hs-api.sh

# Patch customer agent guidelines
hs_patch "/customer-agent/v1/portals/$HUBSPOT_PORTAL_ID/agents/AGENT_ID" '{
  "instructions": "UPDATED_GUIDELINES_TEXT"
}'
```

If API not available, direct to: Customer Agent → Edit → Instructions / Guidelines tab.

---

### 4. Create Contact from Chat Lead

AI Chatbot's handoff flow — when a visitor qualifies:

1. Agent stops conversation and signals handoff
2. Agent asks for info: email, company, name, role, country interest, headcount, timeline
3. Create contact in HubSpot

```bash
source ~/.claude/skills/hubspot-chatbot-manager/scripts/hs-api.sh

# Check for existing contact
hs_post "/crm/v3/objects/contacts/search" '{
  "filterGroups": [{"filters": [{"propertyName": "email","operator": "EQ","value": "VISITOR_EMAIL"}]}],
  "properties": ["firstname","lastname","email","lifecyclestage","hs_lead_status"]
}'

# If no match, create new contact
hs_post "/crm/v3/objects/contacts" '{
  "properties": {
    "firstname": "FIRST",
    "lastname": "LAST",
    "email": "EMAIL",
    "company": "COMPANY",
    "jobtitle": "TITLE",
    "lifecyclestage": "lead",
    "hs_lead_status": "NEW",
    "hs_latest_source": "CHATBOT",
    "atlas_country_interest": "COUNTRIES",
    "atlas_headcount": "HEADCOUNT",
    "atlas_timeline": "TIMELINE"
  }
}'
```

---

### 5. MQL Scoring

Score and upgrade contacts based on chat signals:

```bash
source ~/.claude/skills/hubspot-chatbot-manager/scripts/hs-api.sh

# Score logic:
# +30 → specific country mentioned
# +25 → timeline mentioned  
# +20 → headcount mentioned
# +15 → pricing asked
# +10 → compliance asked
# ≥80 → MQL (marketingqualifiedlead)
# 50-79 → lead
# <50 → subscriber

hs_patch "/crm/v3/objects/contacts/CONTACT_ID" '{
  "properties": {
    "lifecyclestage": "marketingqualifiedlead",
    "hs_lead_status": "IN_PROGRESS",
    "atlas_mql_score": "85",
    "atlas_intent_signal": "global_expansion",
    "atlas_country_interest": "Germany, Brazil",
    "atlas_headcount": "100-500",
    "atlas_timeline": "Q2 2025"
  }
}'
```

---

### 6. Send Conversation Data to Messages Property

After handoff, send the chat summary to the HubSpot contact's messages property:

```bash
source ~/.claude/skills/hubspot-chatbot-manager/scripts/hs-api.sh

# Update messages/notes field with conversation summary
hs_post "/crm/v3/objects/notes" '{
  "properties": {
    "hs_note_body": "Chat summary: [CONVERSATION_SUMMARY]\n\nKey signals: [SIGNALS]\n\nMQL Score: [SCORE]",
    "hs_timestamp": "UNIX_MS_TIMESTAMP"
  },
  "associations": [{
    "to": {"id": "CONTACT_ID"},
    "types": [{"associationCategory": "HUBSPOT_DEFINED","associationTypeId": 202}]
  }]
}'
```

---

### 7. Lead Routing to Rep

Route the MQL to the right rep based on region:

```bash
source ~/.claude/skills/hubspot-chatbot-manager/scripts/hs-api.sh

# Get available reps/owners
hs_get "/crm/v3/owners?limit=100" | python3 -c "
import sys,json; data=json.load(sys.stdin)
for o in data.get('results',[]): print(f'{o[\"id\"]} - {o[\"firstName\"]} {o[\"lastName\"]} ({o[\"email\"]})')
"

# Assign contact to owner
hs_patch "/crm/v3/objects/contacts/CONTACT_ID" '{
  "properties": {"hubspot_owner_id": "OWNER_ID"}
}'
```

Routing logic ([Your Company] ICP):
- EMEA → EMEA reps (Eduardo, Isabel, Bruno are stakeholders)
- APAC → APAC reps
- Enterprise 500+ → AE queue
- SMB <100 → SDR queue

---

### 8. Personalized Follow-Up Message

After routing, create a personalized follow-up note (chat summary, next steps, meeting invite):

```bash
source ~/.claude/skills/hubspot-chatbot-manager/scripts/hs-api.sh

# Create task for the assigned rep
hs_post "/crm/v3/objects/tasks" '{
  "properties": {
    "hs_task_subject": "Follow up with [CONTACT_NAME] — AI Chatbot chat lead",
    "hs_task_body": "Chat summary:\n[SUMMARY]\n\nNext steps:\n1. Send personalized intro email\n2. Share relevant country guide\n3. Book discovery call",
    "hs_task_status": "NOT_STARTED",
    "hs_task_priority": "HIGH",
    "hs_timestamp": "UNIX_MS"
  },
  "associations": [
    {"to": {"id": "CONTACT_ID"}, "types": [{"associationCategory": "HUBSPOT_DEFINED","associationTypeId": 216}]},
    {"to": {"id": "OWNER_ID"}, "types": [{"associationCategory": "HUBSPOT_DEFINED","associationTypeId": 28}]}
  ]
}'
```

---

### 9. Azure Function — Country Data

Test or update the country data Azure Function:

```bash
# Test country data lookup
curl -s -X GET \
  "https://atlas-country-data-action.azurewebsites.net/api/country-data?country=Germany" \
  -H "x-functions-key: $AZURE_FUNC_API_KEY" | python3 -m json.tool

# Test knowledge search
curl -s -X POST \
  "https://atlas-country-data-action.azurewebsites.net/api/knowledge-snippet-search" \
  -H "Content-Type: application/json" \
  -H "x-functions-key: $AZURE_FUNC_API_KEY" \
  -d '{"query": "EOR pricing", "content_scope": "sales_enablement"}' | python3 -m json.tool
```

If `AZURE_FUNC_API_KEY` is unknown, retrieve from Azure portal:
```bash
source ~/.claude/skills/hubspot-chatbot-manager/scripts/hs-api.sh
az login --service-principal \
  -u "$ENTRA_ID_APPLICATION_CLIENT_ID" \
  -p "$ENTRA_ID_CLIENT_SECRET_VALUE" \
  --tenant "$AZURE_TENANT_ID"

az functionapp keys list \
  --name atlas-country-data-action \
  --resource-group "$AZURE_RESOURCE_GROUP"
```

---

### 10. QA Lead Capture (Overdue Task)

End-to-end test: simulate a chat lead → verify contact created in HubSpot:

```bash
source ~/.claude/skills/hubspot-chatbot-manager/scripts/hs-api.sh

# 1. Search for a test contact from recent chat
hs_post "/crm/v3/objects/contacts/search" '{
  "filterGroups": [{"filters": [{"propertyName": "hs_latest_source","operator": "EQ","value": "CHATBOT"}]}],
  "properties": ["firstname","lastname","email","lifecyclestage","hs_lead_status","atlas_mql_score","hubspot_owner_id","createdate"],
  "sorts": [{"propertyName": "createdate","direction": "DESCENDING"}],
  "limit": 10
}'

# 2. Verify contact has required fields
# Expected: email, lifecyclestage=lead/MQL, hs_latest_source=CHATBOT, owner assigned

# 3. Check if note/conversation summary attached
hs_get "/crm/v3/objects/contacts/CONTACT_ID/associations/notes" | python3 -m json.tool
```

QA checklist:
- [ ] Contact created with correct email
- [ ] Source = CHATBOT
- [ ] Lifecycle stage set (lead or MQL)
- [ ] MQL score populated
- [ ] Country/timeline/headcount captured
- [ ] Owner assigned (routing worked)
- [ ] Conversation note attached
- [ ] No duplicate contacts

---

### 11. Deploy to Pricing Page (Launch Task)

Confirm AI Chatbot is live and targeting the right URL:

```bash
source ~/.claude/skills/hubspot-chatbot-manager/scripts/hs-api.sh

# Check current chatflow targeting and status
hs_get "/conversations/v3/chatflows/86381848" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print('Enabled:', data.get('enabled'))
print('Name:', data.get('name'))
targeting = data.get('targeting', {})
print('Targeting:', json.dumps(targeting, indent=2))
"

# Enable if disabled
hs_patch "/conversations/v3/chatflows/86381848" '{"enabled": true}'
```

To verify live on site, use gstack browse:
```bash
# Navigate to pricing page and check if chat widget loads
```

---

### 12. Add New Tool or Integration

When Patrick asks to add a new capability:
1. Identify the integration type (HubSpot API endpoint, Azure service, webhook)
2. Check `references/hubspot-api-guide.md` or `references/azure-api-guide.md`
3. If not documented, use `WebSearch` to find the HubSpot API docs
4. Implement in a script in `scripts/`
5. Update the relevant reference file
6. Add a new numbered section to this SKILL.md

---

## Handoff Flow (End-to-End)

When AI Chatbot detects a qualified visitor:
1. Agent stops standard conversation
2. Agent asks for: email, company, role, country interest, headcount, timeline
3. Create contact (Step 4) — check for duplicates first
4. Score MQL (Step 5) — calculate based on signals
5. Send conversation data to messages property (Step 6)
6. Route contact to rep (Step 7) — based on region/segment
7. Create personalized follow-up task (Step 8)
8. Agent sends meeting invitation link (TBD — Calendly/Chili Piper integration)

---

## Current Pending Tasks (As of April 12, 2026)

All are Patrick's responsibility and are overdue:

| Task | Due | Status |
|---|---|---|
| Build AI agent + knowledge integration | Apr 3 | OVERDUE |
| Implement chat widget on pricing page | Apr 3 | OVERDUE |
| Connect lead capture to HubSpot | Apr 3 | OVERDUE |
| Configure tracking and analytics | Apr 3 | OVERDUE |
| Configure Azure AI Search + guardrails | Apr 3 | OVERDUE |
| Security + data validation checks | Apr 3 | OVERDUE |
| QA HubSpot lead capture | Apr 10 | OVERDUE |
| Launch pilot on pricing page | Apr 10 | OVERDUE |
| Phase 2 country pages | Apr 17 | UPCOMING |

**4.9.26 update items still pending:**
- [ ] Remove excess knowledge base files (keep only 5 approved URLs)
- [ ] Fix [Your Company] "hxm" lapse in responses (update guidelines)
- [ ] Add explicit sanctioned country responses (update guidelines)
- [ ] Update name + avatar (→ "AI Assistant") — ✅ done per notes
- [ ] Get AZURE_FUNC_API_KEY and add to .env

---

## Rules

- Always source `.env` via `hs-api.sh` — never hardcode tokens
- Always check for duplicate contacts before creating
- After any PATCH/POST, verify by fetching the resource again
- Never delete anything without Deletion Synthesizer approval
- When Azure resources return 401, retrieve the function API key from Azure portal
- Use `/browse` to verify chatbot is live after enabling
- Use Agent Tester (https://app.hubspot.com/customer-agent-tester/[YOUR_PORTAL_ID]) for AI Chatbot QA

---

## Trigger Phrases

- "update AI Chatbot" / "update the chatbot"
- "change the chat flow" / "chatflow settings"
- "fix the inbox routing"
- "update the knowledge base" / "remove knowledge sources"
- "fix the guardrails" / "update guidelines"
- "create a contact from chat" / "lead capture"
- "MQL scoring" / "score this lead"
- "route this lead to a rep"
- "QA the chatbot" / "test lead capture"
- "launch the chatbot on pricing page"
- "Azure function" / "country data API"
- "why isn't the chatbot working"
- "AI Chatbot is broken" / "bot not responding"
- "add country pages to chatbot"