import type { ModelSearchResult, SearchFilters, SourceId } from "../types";
import { adapters } from "./adapters";

const DEFAULT_TIMEOUT_MS = Number(process.env.SEARCH_TIMEOUT_MS ?? 8000);

export async function searchAll(query: string, filters: SearchFilters = {}) {
  const enabled = new Set<SourceId>(filters.sources ?? adapters.map((adapter) => adapter.id));
  const selected = adapters.filter((adapter) => enabled.has(adapter.id));

  const settled = await Promise.allSettled(
    selected.map(async (adapter) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
      try {
        const results = await adapter.search(query, filters, controller.signal);
        return { source: adapter.id, ok: true as const, results };
      } finally {
        clearTimeout(timeout);
      }
    })
  );

  const errors: Array<{ source: string; message: string }> = [];
  const results: ModelSearchResult[] = [];

  for (const item of settled) {
    if (item.status === "fulfilled") {
      results.push(...item.value.results);
    } else {
      errors.push({ source: "unknown", message: item.reason?.message ?? "Unknown search error" });
    }
  }

  return {
    query,
    results: rankAndDedupe(results, query).slice(0, filters.limit ?? 60),
    errors
  };
}

function rankAndDedupe(results: ModelSearchResult[], query: string): ModelSearchResult[] {
  const seen = new Map<string, ModelSearchResult>();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  for (const result of results) {
    const title = result.title.toLowerCase();
    const score =
      terms.reduce((sum, term) => sum + (title.includes(term) ? 10 : 0), 0) +
      (result.thumbnailUrl ? 2 : 0) +
      (result.isFree ? 1 : 0);

    const key = `${slug(result.title)}:${new URL(result.url).hostname.replace(/^www\./, "")}`;
    const candidate = { ...result, score };
    const existing = seen.get(key);
    if (!existing || (existing.score ?? 0) < score) seen.set(key, candidate);
  }

  return [...seen.values()].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);
}
