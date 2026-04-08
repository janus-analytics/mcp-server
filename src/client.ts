const DEFAULT_BASE_URL = "https://api.addjanus.ca/api/v1";

export class JanusClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = (baseUrl || DEFAULT_BASE_URL).replace(/\/$/, "");
  }

  private async request<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "") {
          url.searchParams.set(key, value);
        }
      }
    }

    const response = await fetch(url.toString(), {
      headers: {
        "x-api-key": this.apiKey,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Janus API error ${response.status}: ${body}`);
    }

    return response.json() as Promise<T>;
  }

  async getDashboardStats(apiKeyId?: string) {
    const params: Record<string, string> = {};
    if (apiKeyId) params.apiKeyId = apiKeyId;
    return this.request<DashboardStats>("/dashboard/stats", params);
  }

  async getEvents(options?: EventsQuery) {
    const params: Record<string, string> = {};
    if (options?.type) params.type = options.type;
    if (options?.tags) params.tags = options.tags;
    if (options?.apiKeyId) params.apiKeyId = options.apiKeyId;
    if (options?.from) params.from = options.from;
    if (options?.to) params.to = options.to;
    if (options?.page) params.page = String(options.page);
    if (options?.limit) params.limit = String(options.limit);
    return this.request<EventsResponse>("/events", params);
  }

  async getUsage() {
    return this.request<UsageResponse>("/usage");
  }

  async getUsageByKey() {
    return this.request<UsageByKeyResponse>("/usage/by-key");
  }

  async getJourneys() {
    return this.request<Journey[]>("/journeys");
  }

  async getJourneyResults(id: string, from?: string, to?: string) {
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return this.request<JourneyResults>(`/journeys/${id}/results`, params);
  }

  async getApiKeys() {
    return this.request<ApiKey[]>("/apikeys");
  }
}

// --- Types ---

export interface DashboardStats {
  totalEvents: number;
  eventsByType: { type: string; count: number }[];
  eventsTodayByType: { type: string; count: number }[];
  topPageToday: { path: string; count: number } | null;
  recentEvents: { id: string; type: string; timestamp: string }[];
  uniqueUsers: number;
  uniqueSessions: number;
  eventsToday: number;
  eventsYesterday: number;
  eventsByDay: { date: string; count: number }[];
  bounceRate: number;
  recentVisitors: number;
  topPages: { path: string; count: number }[];
  utmSources: { value: string; count: number }[];
  utmMediums: { value: string; count: number }[];
  utmCampaigns: { value: string; count: number }[];
  topCountries: { code: string; count: number }[];
  source: "db" | "cache";
}

export interface EventsQuery {
  type?: string;
  tags?: string;
  apiKeyId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface EventsResponse {
  data: {
    id: string;
    type: string;
    tags: string[];
    payload: Record<string, unknown>;
    distinctId: string | null;
    sessionId: string | null;
    context: Record<string, unknown>;
    timestamp: string;
    apiKeyId: string | null;
    createdAt: string;
    updatedAt: string;
  }[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface UsageResponse {
  events: { used: number; limit: number; remaining: number; percentUsed: number };
  retention: { months: number; description: string };
  tier: string;
  resetsAt: string;
  apiKeys: { used: number; limit: number };
  allTiers: Record<string, { eventCap: number; retentionMonths: number; retentionDescription: string }>;
}

export interface UsageByKeyResponse {
  perKey: {
    apiKeyId: string | null;
    name: string;
    prefix: string;
    count: number;
  }[];
}

export interface Journey {
  id: string;
  name: string;
  steps: {
    label: string;
    type: "event" | "pageview";
    match: string;
    filter: { field: string; operator: "eq" | "contains"; value: string } | null;
  }[];
  matchOn: "distinctId" | "sessionId";
  windowMinutes: number;
  apiKeyId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JourneyResults {
  journey: {
    id: string;
    name: string;
    matchOn: string;
    windowMinutes: number;
  };
  dateRange: { from: string; to: string };
  steps: {
    position: number;
    label: string;
    match: string;
    type: string;
    entered: number;
    conversionRate: number;
    stepConversionRate: number;
    dropoff: number;
    medianSeconds: number | null;
  }[];
  overallConversion: number;
  source: "db" | "cache";
}

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  allowedOrigins: string[];
  excludedIPs: string[];
  createdAt: string;
  lastUsedAt: string | null;
}
