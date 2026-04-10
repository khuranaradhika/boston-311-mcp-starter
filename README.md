# Boston 311 Hackathon Starter

**Build AI agents on City of Boston data in minutes.**

This starter connects you to the [Boston OpenData MCP server](https://data-mcp.boston.gov/mcp) — live access to 311 service requests, MBTA transit data, and Census demographics. You give the agent instructions and tools, and [Subconscious](https://subconscious.dev) handles the reasoning, tool calling, and multi-step execution. Clone, install, run.

---

## Getting Started

**1. Clone and install**

```bash
git clone <repo-url>
cd boston-mcp-hack
npm install
```

**2. Add your API key**

```bash
cp .env.example .env.local
```

Open `.env.local` and paste your Subconscious API key ([get one free here](https://subconscious.dev/platform)).

**3. Run**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you're live. Click one of the example prompts or type your own question about Boston 311 data.

---

## What You Get

- **Live city data** — the Boston MCP server is pre-connected. Ask about 311 cases, neighborhoods, SLA performance, complaint types, and more.
- **Streaming agent UI** — watch the agent think, call tools, and build its answer step-by-step.
- **Built-in tools** — web search, calculator, and web reader are included alongside the Boston MCP.
- **One file to extend** — add your own tools (MCP servers, custom functions, or platform tools) in `lib/tools.ts`.

---

## Next Steps & Ideas

### Add your own tools

Open `lib/tools.ts` — you'll see the Boston MCP, web search, and two utility tools. Add yours below them:

```ts
// Connect another MCP server
{ type: "mcp", url: "https://your-server.com/mcp" }

// Or add a custom function tool (implement the handler in app/api/tools/route.ts)
{ type: "function", name: "MyTool", description: "...", url, method: "POST", ... }
```

### Ideas to build

- **311 Case Monitor** — track open cases past their SLA deadline and surface the worst offenders
- **Neighborhood Report** — generate a plain-English weekly digest for any zip code
- **Equity Analyzer** — compare response times across neighborhoods to find disparities
- **Voice-Powered Reporter** — let residents report issues hands-free using [VoiceRun](https://voicerun.com/platform/)
- **Multi-Agent Pipeline** — build a 311 data agent + a consumer agent that acts on it (calendar blocks, Slack alerts, email digests)
- **Deploy on NEST** — register your agent on [NANDA NEST](https://nest.projectnanda.org) so other agents can discover and call it

### Partner tools

| Partner | What they do | Link |
|---------|-------------|------|
| Subconscious | Agent reasoning + tool calling | [subconscious.dev](https://subconscious.dev) |
| NANDA / NEST | Agent discovery + A2A protocol | [nest.projectnanda.org](https://nest.projectnanda.org) |
| VoiceRun | Voice agent platform | [voicerun.com](https://voicerun.com/platform/) |
| Maritime | Agent deployment | [maritime.sh](https://maritime.sh) |

---

## Reference

### Project structure

```
lib/tools.ts           ← Add tools here
lib/types.ts           ← System prompt + types
app/api/tools/route.ts ← Add tool handlers here
app/api/agent/         ← Agent endpoints (stream + sync)
components/            ← UI components
```

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUBCONSCIOUS_API_KEY` | Yes | From [subconscious.dev/platform](https://subconscious.dev/platform) |
| `SUBCONSCIOUS_ENGINE` | No | `tim-gpt` (default), `tim-edge`, or `tim-gpt-heavy` |

### Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Dev server + auto-tunnel for tool callbacks |
| `npm run dev:no-tunnel` | Dev server only |
| `npm run build` | Production build |
| `npm run type-check` | TypeScript check |
