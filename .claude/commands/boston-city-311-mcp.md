# Boston City 311 MCP

You are helping a hackathon participant build on the City of Boston 311 MCP server. Use this reference to guide implementation.

## MCP Server

**URL:** `https://data-mcp.boston.gov/mcp`

The server connects directly to the Boston Open Data portal and exposes structured query access to every 311 service request the city has logged since 2011. Access is **read-only** — you can explore and analyze, but not submit or modify records.

### Connecting in this repo

The Boston MCP is already wired into `lib/tools.ts`:

```ts
{ type: "mcp", url: "https://data-mcp.boston.gov/mcp" }
```

The Subconscious agent can call any tool the MCP server exposes. No additional setup is needed — just run `npm run dev` and start asking questions.

### MCP Capabilities

The MCP exposes callable tools to:
- **Query cases** — search and filter 311 service requests
- **Filter by neighborhood or type** — narrow results by geography or complaint category
- **Aggregate by department** — group and count cases by responsible department
- **Look up SLA status** — check whether cases were resolved within their service level agreement
- **Count by date range** — temporal analysis of case volumes

### 311 Dataset Fields

Every 311 service request includes these fields:

**Case lifecycle:**
- `case_enquiry_id` — unique case identifier
- `open_dt`, `closed_dt`, `sla_target_dt` — timestamps for open, close, and SLA deadline
- `on_time` — whether the case was resolved within SLA (yes/no)
- `case_status`, `closure_reason` — current status and why it was closed

**What the request is about:**
- `case_title`, `subject`, `reason`, `type` — categorization of the request

**Who handles it:**
- `department`, `queue` — which city team is responsible

**Where:**
- `neighborhood`, `ward`, `city_council_district`, `police_district`, `fire_district` — geopolitical context
- `location`, `latitude`, `longitude` — precise address and coordinates

**How it was submitted:**
- `source` — channel used (app, phone call, self-service, etc.)

### Additional Data Sources

The Boston MCP also provides access to:
- **MBTA transit data** — real-time transit information and metadata
- **U.S. Census data** — American Community Survey and 2020 Decennial data

---

## Three Levels of Engagement

### Level 1 — Discover & Pitch (Non-technical)
Explore 311 data through the agent. Build a 3-slide pitch:
1. What problem does your idea solve — for residents, city staff, or policymakers?
2. Who is the user? What is the solution? Why does an agent help?
3. How would it make money? What is the business opportunity?

### Level 2 — Build an Agent Application

**Track A — MCP Write (Theoretical):** Design an agent that assumes write access exists — one that submits, updates, or routes 311 requests. The city will enable write access in the future.

**Track B — MCP Read (Build with live data):** Connect the MCP as a tool source and build a working use case.

**Bonus — Multi-Agent with NANDA on NEST**

### Level 3 — Deploy on NEST
Register your agent on the NANDA Index, publish AgentFacts, and build a second consumer agent that discovers yours via A2A protocol.

---

## Implementation Guide

### Adding the MCP to a new tool config

If the participant is building outside this starter repo:

```ts
// In any Subconscious tools array:
{ type: "mcp", url: "https://data-mcp.boston.gov/mcp" }
```

### Example prompts to test the connection

- "What are the most common 311 complaints in Dorchester?"
- "Show me open pothole cases past their SLA deadline"
- "Compare on_time rates across Public Works, Transportation, and Parks"
- "Which neighborhoods have the most open cases right now?"
- "How do submission channels (app vs. phone) differ by neighborhood?"

### Use case ideas by category

**Operations & accountability:**
- SLA breach monitor — open cases past `sla_target_dt`, grouped by department
- Department scorecard — compare `on_time` rates across departments
- Closure rate tracker — % of cases closed within 30/60/90 days
- Queue depth dashboard — open cases per queue and how long they've been open
- Seasonal demand forecaster — how pothole, snow plowing, street cleaning requests spike by month

**Neighborhood intelligence:**
- Neighborhood health score — composite score based on volume, SLA hit rate, closure speed
- Complaint concentration map — cluster lat/long to find geographic hotspots
- Ward comparison tool — top 5 complaint categories for a council district vs. city average
- Zip code digest — weekly natural-language summary for a given zip code

**Resident tools:**
- Case status explainer — given a case ID, explain in plain English where it stands
- "Is my street clean?" checker — recent street cleaning or pothole cases near an address
- Delay predictor — estimate how long a new case will take to close based on historical data
- Resident report card — last 90 days of city service activity for a zip code

**Policy & equity:**
- Equity gap report — compare SLA on-time rates between neighborhoods using ward/district as proxy
- Response disparity detector — find closure time differences for the same case type across neighborhoods
- Abandoned vehicle hotspot finder — where abandoned vehicle cases cluster and how long they stay open

**Journalism & research:**
- Anomaly alert — detect unusual spikes in any case type in the last 7 days
- Trend story generator — data-backed narrative for a case type over a date range
- City responsiveness index — rank neighborhoods by closure speed over 12 months
- Source bias analyzer — are app-submitted cases resolved faster than phone calls?

**Real estate & PropTech:**
- Street-level condition score — last 12 months of nearby cases as a livability signal
- Neighborhood trajectory report — complaint volume trending up or down?

### Multi-agent ideas (Level 3 / NANDA NEST)

Each is a two-agent pipeline — the 311 agent supplies data, a consumer agent acts on it:
- **Commute avoidance** — 311 agent surfaces potholes/road closures near a route; commuter agent suggests rerouting
- **Calendar protection** — check for snow plowing/street cleaning; block calendar time or send Slack reminder
- **Property due diligence** — real estate agent pulls 2 years of nearby cases for an investment memo
- **Neighborhood newsletter** — email agent drafts a weekly resident newsletter from 311 data
- **City council briefing** — generate structured briefing on SLA performance for a council district
- **Equity watchdog** — monitor for neighborhoods where SLA breach rate exceeds a threshold

When helping participants, guide them toward a use case that matches their skill level and the time available (~2.5 hours). Most teams should aim for Level 2 Track B as their primary deliverable.
