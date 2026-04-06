# Janus Analytics MCP Server

An [MCP server](https://modelcontextprotocol.io) that connects AI coding agents to your [Janus](https://addjanus.ca) analytics. Query your dashboard, events, funnels, and usage directly from Claude Code, Cursor, Windsurf, or any MCP-compatible client.

## Setup

### 1. Get a Janus API key

Sign up at [addjanus.ca](https://addjanus.ca) and create an API key in Settings.

### 2. Add to your MCP client

**Claude Code**

```bash
claude mcp add janus -- npx -y @janus-analytics/mcp-server
```

Then set your API key:

```bash
export JANUS_API_KEY=jns_your_key_here
```

**Claude Desktop / Cursor / Windsurf**

Add to your MCP config file:

```json
{
  "mcpServers": {
    "janus": {
      "command": "npx",
      "args": ["-y", "@janus-analytics/mcp-server"],
      "env": {
        "JANUS_API_KEY": "jns_your_key_here"
      }
    }
  }
}
```

Config file locations:
- **Claude Desktop:** `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows)
- **Cursor:** Settings > MCP Servers
- **Windsurf:** `~/.windsurf/mcp.json`

## Tools

All tools are **read-only** — the server never modifies your data.

| Tool | Description |
|------|-------------|
| `get_dashboard_stats` | Event counts, unique visitors, top pages, referrers, UTM sources, countries, bounce rate, and daily trends. Optional `apiKeyId` filter. |
| `query_events` | Search the event log with filters for type, tags, date range, API key, and pagination. |
| `get_usage` | Current month's event usage vs. tier cap, API key count, and per-key breakdown. |
| `list_journeys` | List all funnels with step definitions, match scope, and conversion windows. |
| `get_journey_results` | Funnel conversion data — per-step counts, conversion rates, and median time between steps. |
| `list_api_keys` | Your API keys with names, prefixes, allowed origins, and last-used dates. |

## Example prompts

Once connected, ask your AI agent things like:

- "How's my traffic looking this week?"
- "Show me the top pages from the last 7 days"
- "What's my funnel conversion rate for the signup journey?"
- "Am I close to my usage limit this month?"
- "Which API key is getting the most events?"

## Configuration

| Environment variable | Required | Description |
|---------------------|----------|-------------|
| `JANUS_API_KEY` | Yes | Your Janus API key (starts with `jns_`) |
| `JANUS_API_URL` | No | Override the API base URL (defaults to `https://api.addjanus.ca/api/v1`) |

## License

MIT
