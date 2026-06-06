import * as cheerio from "cheerio";
import { absolutize, stableId } from "./http";
import type { ModelSearchResult, SourceId } from "../types";

type ExtractOptions = {
  source: SourceId;
  baseUrl: string;
  itemUrlIncludes: string[];
  titleFallback?: string;
};

export function extractGenericCards(html: string, options: ExtractOptions): ModelSearchResult[] {
  const $ = cheerio.load(html);
  const results = new Map<string, ModelSearchResult>();

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    const url = absolutize(href, options.baseUrl);
    if (!url) return;

    const lower = url.toLowerCase();
    if (!options.itemUrlIncludes.some((part) => lower.includes(part.toLowerCase()))) return;

    const title =
      clean($(el).attr("title")) ||
      clean($(el).find("img").attr("alt")) ||
      clean($(el).text()) ||
      options.titleFallback;

    if (!title || title.length < 3) return;

    const img =
      absolutize($(el).find("img").attr("src"), options.baseUrl) ||
      absolutize($(el).find("img").attr("data-src"), options.baseUrl) ||
      absolutize($(el).closest("article, div, li").find("img").first().attr("src"), options.baseUrl);

    const key = normalizeUrl(url);
    if (!results.has(key)) {
      results.set(key, {
        id: stableId(options.source, key),
        source: options.source,
        title,
        url: key,
        thumbnailUrl: img,
        isFree: inferFree($, el)
      });
    }
  });

  return [...results.values()].slice(0, 24);
}

function clean(value?: string): string | undefined {
  const cleaned = value?.replace(/\s+/g, " ").trim();
  if (!cleaned || cleaned.length > 180) return undefined;
  return cleaned;
}

function normalizeUrl(url: string): string {
  const parsed = new URL(url);
  parsed.hash = "";
  for (const key of [...parsed.searchParams.keys()]) {
    if (key.startsWith("utm_")) parsed.searchParams.delete(key);
  }
  return parsed.toString();
}

function inferFree($: cheerio.CheerioAPI, el: cheerio.Element): boolean | undefined {
  const text = $(el).closest("article, div, li").text().toLowerCase();
  if (/\bfree\b/.test(text)) return true;
  if (/\$\s?\d|€\s?\d|£\s?\d/.test(text)) return false;
  return undefined;
}
