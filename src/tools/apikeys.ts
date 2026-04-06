import type { JanusClient } from "../client.js";

export const apiKeysTool = {
  name: "list_api_keys",
  description:
    "List your Janus API keys with names, prefixes, allowed origins, and last-used dates. Does not expose the full secret key values.",
  inputSchema: {
    type: "object" as const,
    properties: {},
  },
};

export async function handleListApiKeys(client: JanusClient): Promise<string> {
  const keys = await client.getApiKeys();
  const lines: string[] = [];

  lines.push(`# API Keys (${keys.length})\n`);

  if (keys.length === 0) {
    lines.push("No API keys found.");
    return lines.join("\n");
  }

  for (const k of keys) {
    lines.push(`## ${k.name}`);
    lines.push(`  ID: ${k.id}`);
    lines.push(`  Prefix: ${k.prefix}`);
    if (k.allowedOrigins.length > 0) {
      lines.push(`  Allowed origins: ${k.allowedOrigins.join(", ")}`);
    }
    lines.push(`  Created: ${k.createdAt}`);
    lines.push(`  Last used: ${k.lastUsedAt || "never"}`);
    lines.push("");
  }

  return lines.join("\n");
}
