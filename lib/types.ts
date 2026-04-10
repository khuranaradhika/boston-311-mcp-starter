/**
 * Shared types for Subconscious agent requests and responses.
 */

export interface AgentRequest {
  message: string;
  conversationHistory?: ChatMessage[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AgentResponse {
  answer: string;
  runId: string;
  toolCalls?: ToolCallInfo[];
}

export interface ToolCallInfo {
  name: string;
  input: Record<string, unknown>;
  output?: unknown;
}

const BOSTON_311_CONTEXT = `You are a Boston 311 assistant helping users explore and analyze City of Boston service request data.

You have access to the Boston OpenData MCP server, which provides read-only access to:
- 311 Service Requests (since 2011): case type, status, SLA target/on-time, neighborhood, ward, city council district, department, queue, source channel, coordinates, open/close dates
- MBTA transit data
- U.S. Census demographic data

Use the Boston MCP tools to query 311 data. Use web_search for supplementary research. Data is read-only — you can explore and analyze but not submit or modify records.

When answering, be specific with data. Cite neighborhoods, case counts, date ranges, and percentages where possible.`;

/**
 * The Subconscious SDK takes a single `instructions` string, not a
 * messages array. This helper flattens chat history into one prompt
 * and prepends Boston 311 system context.
 */
export function buildInstructions(
  message: string,
  history?: ChatMessage[],
): string {
  const userPrompt = (() => {
    if (!history?.length) return message;
    const conversation = history
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n\n");
    return `${conversation}\n\nUser: ${message}\n\nRespond to the user's latest message.`;
  })();

  return `${BOSTON_311_CONTEXT}\n\n${userPrompt}`;
}

/**
 * The reasoning tree that Subconscious returns after a run.
 *
 * Each node represents one step the agent took:
 *   - title:      what the agent is doing ("Research the topic")
 *   - thought:    its internal reasoning
 *   - tooluse:    tools it called and their results
 *   - subtask:    nested sub-steps (the agent breaking the problem down)
 *   - conclusion: the step's outcome
 */
export interface ReasoningNode {
  title?: string;
  thought?: string;
  tooluse?: Array<{
    tool_name?: string;
    parameters?: Record<string, unknown>;
    tool_result?: unknown;
  }>;
  subtask?: ReasoningNode[];
  conclusion?: string;
}

/** Recursively walk the reasoning tree and collect every tool invocation. */
export function extractToolCalls(reasoning?: ReasoningNode): ToolCallInfo[] {
  if (!reasoning) return [];
  const calls: ToolCallInfo[] = [];

  function traverse(node: ReasoningNode) {
    for (const tu of node.tooluse ?? []) {
      if (tu.tool_name) {
        calls.push({
          name: tu.tool_name,
          input: tu.parameters ?? {},
          output: tu.tool_result,
        });
      }
    }
    for (const sub of node.subtask ?? []) {
      traverse(sub);
    }
  }

  traverse(reasoning);
  return calls;
}
