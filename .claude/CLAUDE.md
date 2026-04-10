# Boston 311 Hackathon Starter

Build AI agents on City of Boston 311 data. Powered by [Subconscious](https://subconscious.dev).

## Get Running

```bash
npm install
cp .env.example .env.local        # Add your SUBCONSCIOUS_API_KEY
npm run dev                        # Opens localhost:3000 with live 311 data
```

Get an API key at [subconscious.dev/platform](https://subconscious.dev/platform).

## How This App Works

1. User types a question in the UI
2. `components/AgentRunner.tsx` sends it to `app/api/agent/stream/route.ts`
3. The API route calls `client.stream()` from the Subconscious SDK with the user's instructions + all configured tools
4. The agent reasons, calls tools (Boston MCP, web search, etc.), and streams results back as SSE
5. The UI renders reasoning steps, tool calls, and the final answer in real-time

## Where to Make Changes

| I want to...                        | Edit this file               |
|-------------------------------------|------------------------------|
| Add a new tool (MCP, function, etc) | `lib/tools.ts`               |
| Add a handler for a function tool   | `app/api/tools/route.ts`     |
| Change the agent's system prompt    | `lib/types.ts` (`BOSTON_311_CONTEXT`) |
| Change the UI layout or header      | `app/page.tsx`               |
| Change example prompts              | `components/AgentRunner.tsx`  |
| Change the streaming logic          | `app/api/agent/stream/route.ts` |

## Skills (Slash Commands)

Use these for in-depth guidance:

- `/boston-city-311-mcp` — What the 311 MCP exposes, dataset fields, use case ideas, all three hackathon levels
- `/subconscious-dev` — Full Subconscious SDK reference: client methods, tool types, streaming patterns, structured output, error handling

## Tools Pre-Configured

- **Boston MCP** (`https://data-mcp.boston.gov/mcp`) — 311 service requests since 2011, MBTA, Census data. Read-only.
- **web_search** — Subconscious-hosted web search
- **Calculator** — Math expression evaluator (self-hosted at `/api/tools`)
- **WebReader** — Fetch and extract text from URLs (self-hosted at `/api/tools`)

## Adding a New Tool

Open `lib/tools.ts` and add to the `getTools()` array:

```ts
// MCP server:
{ type: "mcp", url: "https://your-server.com/mcp" }

// Function tool (then add handler in app/api/tools/route.ts):
{ type: "function", name: "MyTool", description: "...", url, method: "POST", timeout: 10, parameters: { ... } }

// Platform tool:
{ type: "platform", id: "web_search", options: {} }
```

## Commands

| Command               | What it does                              |
|-----------------------|-------------------------------------------|
| `npm run dev`         | Dev server + Cloudflare tunnel for tools  |
| `npm run dev:no-tunnel` | Dev server only (no self-hosted tool callbacks) |
| `npm run build`       | Production build                          |
| `npm run type-check`  | TypeScript check                          |
| `npm run lint`        | ESLint                                    |

## Key Conventions

- The Subconscious SDK takes a single `instructions` string, not a messages array. `buildInstructions()` in `lib/types.ts` handles this.
- The dev tunnel is only needed for self-hosted function tools. MCP tools are called server-side by Subconscious directly.
- Tool handler names in `app/api/tools/route.ts` must exactly match `name` in `lib/tools.ts`.
