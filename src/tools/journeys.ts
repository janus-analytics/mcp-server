import type { JanusClient } from "../client.js";

export const listJourneysTool = {
  name: "list_journeys",
  description:
    "List all defined user journeys (funnels). Shows step definitions, match scope, and conversion window for each journey.",
  inputSchema: {
    type: "object" as const,
    properties: {},
  },
};

export const journeyResultsTool = {
  name: "get_journey_results",
  description:
    "Get funnel conversion data for a specific journey. Shows per-step entered/converted/dropped counts, conversion rates, and median time between steps.",
  inputSchema: {
    type: "object" as const,
    properties: {
      journeyId: {
        type: "string",
        description: "The journey ID (UUID). Use list_journeys to find available IDs.",
      },
      from: {
        type: "string",
        description: "Start date (ISO 8601). Defaults to 30 days ago.",
      },
      to: {
        type: "string",
        description: "End date (ISO 8601). Defaults to now.",
      },
    },
    required: ["journeyId"],
  },
};

export async function handleListJourneys(client: JanusClient): Promise<string> {
  const journeys = await client.getJourneys();
  const lines: string[] = [];

  lines.push(`# Journeys (${journeys.length} defined)\n`);

  if (journeys.length === 0) {
    lines.push("No journeys defined. Create one in the Janus dashboard at /journeys.");
    return lines.join("\n");
  }

  for (const j of journeys) {
    lines.push(`## ${j.name}`);
    lines.push(`  ID: ${j.id}`);
    lines.push(`  Match on: ${j.matchOn}, window: ${j.windowMinutes} min`);
    lines.push(`  Steps:`);
    for (let i = 0; i < j.steps.length; i++) {
      const s = j.steps[i];
      let step = `    ${i + 1}. ${s.label} (${s.type}: ${s.match})`;
      if (s.filter) step += ` [${s.filter.field} ${s.filter.operator} "${s.filter.value}"]`;
      lines.push(step);
    }
    lines.push("");
  }

  return lines.join("\n");
}

export async function handleJourneyResults(
  client: JanusClient,
  args: { journeyId: string; from?: string; to?: string }
): Promise<string> {
  const result = await client.getJourneyResults(args.journeyId, args.from, args.to);
  const lines: string[] = [];

  lines.push(`# ${result.journey.name} — Funnel Results\n`);
  lines.push(`Date range: ${result.dateRange.from} to ${result.dateRange.to}`);
  lines.push(`Match on: ${result.journey.matchOn}, window: ${result.journey.windowMinutes} min`);
  lines.push(`Overall conversion: ${result.overallConversion}%\n`);

  lines.push(`## Steps`);
  for (const s of result.steps) {
    lines.push(`### ${s.position}. ${s.label} (${s.type}: ${s.match})`);
    lines.push(`  Entered: ${s.entered.toLocaleString()}`);
    lines.push(`  Conversion rate: ${s.conversionRate}%`);
    lines.push(`  Step conversion: ${s.stepConversionRate}%`);
    lines.push(`  Dropoff: ${s.dropoff.toLocaleString()}`);
    if (s.medianSeconds !== null) {
      lines.push(`  Median time from previous: ${s.medianSeconds}s`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
