# Subconscious SDK Development Guide

You are helping a developer build with the Subconscious SDK. Use this reference for all implementation work.

## Quick Start

```ts
import { Subconscious } from "subconscious";

const client = new Subconscious({ apiKey: process.env.SUBCONSCIOUS_API_KEY });
```

The SDK has two main methods: `client.run()` (wait for result) and `client.stream()` (real-time SSE).

---

## Core Methods

### `client.stream()` — Real-Time Streaming

Returns an async generator of SSE events. Best for UIs.

```ts
const stream = client.stream({
  engine: "tim-gpt",
  input: {
    instructions: "Your prompt here",
    tools: getTools(),
    answerFormat?: OutputSchema,    // Optional structured output
  },
});

for await (const event of stream) {
  if (event.type === "delta") {
    // event.content — string chunk of the reasoning JSON
    // event.runId — run identifier
  } else if (event.type === "done") {
    // Completed
  } else if (event.type === "error") {
    // event.message, event.code
  }
}
```

### `client.run()` — Execute & Wait

```ts
const run = await client.run({
  engine: "tim-gpt",
  input: {
    instructions: "Your prompt here",
    tools: getTools(),
  },
  options: { awaitCompletion: true },
});

// run.runId — identifier
// run.status — "queued" | "running" | "succeeded" | "failed" | "canceled" | "timed_out"
// run.result?.answer — the final answer
// run.result?.reasoning — the reasoning tree (ReasoningNode)
// run.usage?.models — token usage per engine
```

### `client.get(runId)` — Check Status

```ts
const status = await client.get(runId);
```

### `client.wait(runId, options?)` — Poll Until Complete

```ts
const result = await client.wait(runId, {
  intervalMs: 2000,
  maxAttempts: 60,
  signal: abortController.signal,
});
```

### `client.cancel(runId)` — Cancel a Run

```ts
await client.cancel(runId);
```

---

## Tools

Three types of tools can be passed in the `tools` array in `lib/tools.ts`:

### Platform Tools (Subconscious-hosted)

```ts
{ type: "platform", id: "web_search", options: {} }
```

Available: `web_search`, `fast_search`, `fresh_search`, `page_reader`, `find_similar`, `people_search`, `company_search`, `news_search`, `tweet_search`, `research_paper_search`, `google_search`

### Function Tools (Self-hosted HTTP endpoints)

```ts
{
  type: "function",
  name: "MyTool",
  description: "What this tool does",
  url: "https://your-app.com/api/tools",
  method: "POST",
  timeout: 10,
  parameters: {
    type: "object",
    properties: {
      input: { type: "string", description: "The input" },
    },
    required: ["input"],
  },
  headers?: { "Authorization": "Bearer ..." },  // Custom HTTP headers
  defaults?: { apiKey: "hidden-from-model" },    // Injected params, hidden from model
}
```

Then add a handler in `app/api/tools/route.ts`:

```ts
async function myTool(params: Record<string, unknown>) {
  const { input } = params;
  // ... your logic
  return { result: "..." };
}

// Add to handlers map:
const handlers = {
  Calculator: calculator,
  WebReader: webReader,
  MyTool: myTool,  // Name must match tools.ts
};
```

Subconscious POSTs `{ tool_name, parameters, request_id }` to your endpoint. Return a JSON object.

### MCP Tools (Model Context Protocol)

```ts
{ type: "mcp", url: "https://data-mcp.boston.gov/mcp" }
```

Optional `allow` array to filter exposed tools:
```ts
{ type: "mcp", url: "https://example.com/mcp", allow: ["query_database"] }
```

---

## Engines

| Engine | Best for |
|--------|----------|
| `tim-gpt` | Most use cases (default) |
| `tim-edge` | Speed and efficiency |
| `tim-gpt-heavy` | Maximum capability |
| `tim` | General flagship |
| `timini` | Complex reasoning (Gemini Flash) |

---

## Structured Output

### With Zod (recommended)

```ts
import { z } from "zod";
import { zodToJsonSchema } from "subconscious";

const schema = z.object({
  summary: z.string().describe("Brief summary"),
  score: z.number().describe("Score 1-10"),
  tags: z.array(z.string()),
});

const run = await client.run({
  engine: "tim-gpt",
  input: {
    instructions: "Analyze...",
    tools: [],
    answerFormat: zodToJsonSchema(schema, "Analysis"),
  },
  options: { awaitCompletion: true },
});
```

### Manual JSON Schema

```ts
answerFormat: {
  title: "Result",
  type: "object",
  properties: {
    summary: { type: "string" },
    score: { type: "number" },
  },
  required: ["summary", "score"],
}
```

---

## Reasoning Tree

After completion, `run.result?.reasoning` is a recursive tree:

```ts
interface ReasoningNode {
  title?: string;       // Step description
  thought?: string;     // Internal reasoning
  tooluse?: Array<{
    tool_name?: string;
    parameters?: Record<string, unknown>;
    tool_result?: unknown;
  }>;
  subtask?: ReasoningNode[];  // Nested sub-steps
  conclusion?: string;         // Step outcome
}
```

---

## Error Handling

```ts
import {
  SubconsciousError,
  AuthenticationError,
  RateLimitError,
  NotFoundError,
  ValidationError,
} from "subconscious";

try {
  const run = await client.run(params);
} catch (error) {
  if (error instanceof AuthenticationError) { /* bad API key */ }
  if (error instanceof RateLimitError) { /* wait and retry */ }
  if (error instanceof ValidationError) { /* check error.details */ }
}
```

---

## Patterns Used in This Repo

### SSE Streaming (Next.js App Router)

`app/api/agent/stream/route.ts` — streams events to the browser:

```ts
const stream = client.stream({ engine, input: { instructions, tools } });

const readable = new ReadableStream({
  async start(controller) {
    for await (const event of stream) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
    }
    controller.close();
  },
});

return new Response(readable, {
  headers: { "Content-Type": "text/event-stream" },
});
```

### System Prompt + Chat History

`lib/types.ts` — `buildInstructions()` prepends a system context and flattens chat history into a single `instructions` string (the SDK takes one string, not a messages array).

### Tool Registration

`lib/tools.ts` — `getTools()` returns the full tool array. `getToolRegistry()` derives sidebar metadata. Add new tools to the array in `getTools()`.

### Tool Dispatch

`app/api/tools/route.ts` — when Subconscious calls a function tool, it POSTs `{ tool_name, parameters, request_id }` to your URL. The dispatcher matches `tool_name` to a handler function.

---

## Key Design Decisions

1. **Single instruction string** — the SDK takes one `instructions` string, not a messages array. Flatten chat history into it.
2. **Tools are mixed** — platform, function, and MCP tools coexist in one array.
3. **Defaults hide secrets** — use `defaults` on function tools to inject API keys without exposing them to the model.
4. **Dev tunnel** — `npm run dev` creates a Cloudflare tunnel so Subconscious can call your self-hosted tools locally. MCP tools don't need the tunnel.

When implementing, always check `lib/tools.ts` for the current tool config and `app/api/tools/route.ts` for existing handlers before adding new ones.
