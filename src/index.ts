#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { JanusClient } from "./client.js";
import { handleDashboardStats } from "./tools/dashboard.js";
import { handleQueryEvents } from "./tools/events.js";
import { handleGetUsage } from "./tools/usage.js";
import { handleListJourneys, handleJourneyResults } from "./tools/journeys.js";
import { handleListApiKeys } from "./tools/apikeys.js";

const apiKey = process.env.JANUS_API_KEY;
if (!apiKey) {
  console.error("JANUS_API_KEY environment variable is required");
  process.exit(1);
}

const client = new JanusClient(apiKey, process.env.JANUS_API_URL);

const server = new McpServer({
  name: "janus-analytics",
  version: "1.0.0",
});

// --- Tools ---

server.tool(
  "get_dashboard_stats",
  "Get dashboard analytics: event counts, unique visitors, top pages, referrers, UTM sources, country breakdown, bounce rate, and daily event trends.",
  {
    apiKeyId: z.string().uuid().optional().describe("Filter stats to a specific API key (UUID). Omit to see stats across all keys."),
  },
  async ({ apiKeyId }) => {
    const text = await handleDashboardStats(client, { apiKeyId });
    return { content: [{ type: "text", text }] };
  }
);

server.tool(
  "query_events",
  "Search and filter the event log. Supports filtering by event type, tags, date range, and API key. Returns paginated results.",
  {
    type: z.string().optional().describe("Filter by event type (e.g. 'pageview', 'cta_click')."),
    tags: z.string().optional().describe("Comma-separated tags to filter by."),
    apiKeyId: z.string().uuid().optional().describe("Filter to events from a specific API key (UUID)."),
    from: z.string().optional().describe("Start date (ISO 8601)."),
    to: z.string().optional().describe("End date (ISO 8601)."),
    page: z.number().int().positive().optional().describe("Page number (default: 1)."),
    limit: z.number().int().min(1).max(100).optional().describe("Results per page (default: 20, max: 100)."),
  },
  async (args) => {
    const text = await handleQueryEvents(client, args);
    return { content: [{ type: "text", text }] };
  }
);

server.tool(
  "get_usage",
  "Check current month's event usage against your tier cap, API key count, and per-key breakdown.",
  {},
  async () => {
    const text = await handleGetUsage(client);
    return { content: [{ type: "text", text }] };
  }
);

server.tool(
  "list_journeys",
  "List all defined user journeys (funnels) with their step definitions, match scope, and conversion window.",
  {},
  async () => {
    const text = await handleListJourneys(client);
    return { content: [{ type: "text", text }] };
  }
);

server.tool(
  "get_journey_results",
  "Get funnel conversion data for a specific journey — per-step entered/converted/dropped counts, conversion rates, and median time between steps.",
  {
    journeyId: z.string().uuid().describe("The journey ID (UUID). Use list_journeys to find available IDs."),
    from: z.string().optional().describe("Start date (ISO 8601). Defaults to 30 days ago."),
    to: z.string().optional().describe("End date (ISO 8601). Defaults to now."),
  },
  async ({ journeyId, from, to }) => {
    const text = await handleJourneyResults(client, { journeyId, from, to });
    return { content: [{ type: "text", text }] };
  }
);

server.tool(
  "list_api_keys",
  "List your Janus API keys with names, prefixes, allowed origins, and last-used dates.",
  {},
  async () => {
    const text = await handleListApiKeys(client);
    return { content: [{ type: "text", text }] };
  }
);

// --- Start ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
