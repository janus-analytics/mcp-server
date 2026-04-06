import type { JanusClient } from "../client.js";

export const usageTool = {
  name: "get_usage",
  description:
    "Check current month's event usage against your tier cap, API key count, and see limits for all tiers. Useful for checking if you're approaching your monthly event limit.",
  inputSchema: {
    type: "object" as const,
    properties: {},
  },
};

export async function handleGetUsage(client: JanusClient): Promise<string> {
  const [usage, byKey] = await Promise.all([
    client.getUsage(),
    client.getUsageByKey(),
  ]);

  const lines: string[] = [];

  lines.push("# Usage\n");
  lines.push(`## This Month`);
  lines.push(`- Tier: ${usage.tier}`);
  lines.push(`- Events: ${usage.events.used.toLocaleString()} / ${usage.events.limit.toLocaleString()} (${usage.events.percentUsed.toFixed(1)}%)`);
  lines.push(`- Remaining: ${usage.events.remaining.toLocaleString()}`);
  lines.push(`- Resets: ${usage.resetsAt}`);
  lines.push(`- Data retention: ${usage.retention.description}`);
  lines.push(`- API keys: ${usage.apiKeys.used} / ${usage.apiKeys.limit}`);

  if (byKey.perKey.length > 0) {
    lines.push(`\n## Events by API Key`);
    for (const k of byKey.perKey) {
      lines.push(`- ${k.name} (${k.prefix}): ${k.count.toLocaleString()}`);
    }
  }

  lines.push(`\n## Tier Limits`);
  for (const [tier, limits] of Object.entries(usage.allTiers)) {
    lines.push(`- ${tier}: ${limits.eventCap.toLocaleString()} events/mo, ${limits.retentionDescription} retention`);
  }

  return lines.join("\n");
}
