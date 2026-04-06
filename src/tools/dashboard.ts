import type { JanusClient, DashboardStats } from "../client.js";

export const dashboardTool = {
  name: "get_dashboard_stats",
  description:
    "Get dashboard analytics: event counts, unique visitors, top pages, referrers, UTM sources, country breakdown, bounce rate, and daily event trends. Returns the same data that powers the Janus dashboard.",
  inputSchema: {
    type: "object" as const,
    properties: {
      apiKeyId: {
        type: "string",
        description: "Filter stats to a specific API key (UUID). Omit to see stats across all keys.",
      },
    },
  },
};

export async function handleDashboardStats(
  client: JanusClient,
  args: { apiKeyId?: string }
): Promise<string> {
  const stats = await client.getDashboardStats(args.apiKeyId);
  return formatDashboardStats(stats);
}

function formatDashboardStats(stats: DashboardStats): string {
  const lines: string[] = [];

  lines.push("# Dashboard Stats\n");

  lines.push(`## Overview`);
  lines.push(`- Total events: ${stats.totalEvents.toLocaleString()}`);
  lines.push(`- Events today: ${stats.eventsToday.toLocaleString()}`);
  lines.push(`- Events yesterday: ${stats.eventsYesterday.toLocaleString()}`);
  lines.push(`- Unique users: ${stats.uniqueUsers.toLocaleString()}`);
  lines.push(`- Unique sessions: ${stats.uniqueSessions.toLocaleString()}`);
  lines.push(`- Bounce rate: ${stats.bounceRate}%`);
  lines.push(`- Recent visitors (last 5 min): ${stats.recentVisitors}`);

  if (stats.topPageToday) {
    lines.push(`- Top page today: ${stats.topPageToday.path} (${stats.topPageToday.count} views)`);
  }

  if (stats.eventsByType.length > 0) {
    lines.push(`\n## Events by Type`);
    for (const e of stats.eventsByType) {
      lines.push(`- ${e.type}: ${e.count.toLocaleString()}`);
    }
  }

  if (stats.topPages.length > 0) {
    lines.push(`\n## Top Pages`);
    for (const p of stats.topPages) {
      lines.push(`- ${p.path}: ${p.count.toLocaleString()} views`);
    }
  }

  if (stats.topCountries.length > 0) {
    lines.push(`\n## Top Countries`);
    for (const c of stats.topCountries) {
      lines.push(`- ${c.code}: ${c.count.toLocaleString()}`);
    }
  }

  if (stats.utmSources.length > 0) {
    lines.push(`\n## UTM Sources`);
    for (const u of stats.utmSources) {
      lines.push(`- ${u.value}: ${u.count.toLocaleString()}`);
    }
  }

  if (stats.utmCampaigns.length > 0) {
    lines.push(`\n## UTM Campaigns`);
    for (const u of stats.utmCampaigns) {
      lines.push(`- ${u.value}: ${u.count.toLocaleString()}`);
    }
  }

  if (stats.eventsByDay.length > 0) {
    lines.push(`\n## Daily Trend (last ${stats.eventsByDay.length} days)`);
    for (const d of stats.eventsByDay) {
      lines.push(`- ${d.date}: ${d.count.toLocaleString()}`);
    }
  }

  return lines.join("\n");
}
