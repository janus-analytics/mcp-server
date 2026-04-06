import type { JanusClient } from "../client.js";

export const eventsTool = {
  name: "query_events",
  description:
    "Search and filter the event log. Supports filtering by event type, tags, date range, and API key. Returns paginated results with event details including payload, context, and tags.",
  inputSchema: {
    type: "object" as const,
    properties: {
      type: {
        type: "string",
        description: "Filter by event type (e.g. 'pageview', 'cta_click', 'signup').",
      },
      tags: {
        type: "string",
        description: "Comma-separated tags to filter by (e.g. 'error,critical').",
      },
      apiKeyId: {
        type: "string",
        description: "Filter to events from a specific API key (UUID).",
      },
      from: {
        type: "string",
        description: "Start date (ISO 8601, e.g. '2026-03-01T00:00:00Z').",
      },
      to: {
        type: "string",
        description: "End date (ISO 8601, e.g. '2026-03-31T23:59:59Z').",
      },
      page: {
        type: "number",
        description: "Page number (default: 1).",
      },
      limit: {
        type: "number",
        description: "Results per page (default: 20, max: 100).",
      },
    },
  },
};

export async function handleQueryEvents(
  client: JanusClient,
  args: {
    type?: string;
    tags?: string;
    apiKeyId?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }
): Promise<string> {
  const result = await client.getEvents(args);
  const lines: string[] = [];

  lines.push(`# Events (page ${result.meta.page} of ${result.meta.pages}, ${result.meta.total} total)\n`);

  if (result.data.length === 0) {
    lines.push("No events found matching your filters.");
    return lines.join("\n");
  }

  for (const event of result.data) {
    lines.push(`## ${event.type} — ${event.timestamp}`);
    if (event.tags.length > 0) lines.push(`  Tags: ${event.tags.join(", ")}`);
    if (event.distinctId) lines.push(`  User: ${event.distinctId}`);
    if (event.sessionId) lines.push(`  Session: ${event.sessionId}`);
    if (event.payload && Object.keys(event.payload).length > 0) {
      lines.push(`  Payload: ${JSON.stringify(event.payload)}`);
    }
    if (event.context && Object.keys(event.context).length > 0) {
      lines.push(`  Context: ${JSON.stringify(event.context)}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
