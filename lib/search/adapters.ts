import type { SourceAdapter } from "../types";
import { fetchHtml } from "./http";
import { extractGenericCards } from "./extract";
import * as cheerio from "cheerio";

export const adapters: SourceAdapter[] = [
  {
    id: "makerworld",
    label: "MakerWorld",
    async search(query, _filters, signal) {
      const url = `https://makerworld.com/en/search/models?keyword=${encodeURIComponent(query)}`;
      const html = await fetchHtml(url, signal);
      return extractGenericCards(html, {
        source: "makerworld",
        baseUrl: "https://makerworld.com",
        itemUrlIncludes: ["/en/models/"]
      });
    }
  },
  {
    id: "thangs",
    label: "Thangs",
    async search(query, _filters, signal) {
      const url = `https://thangs.com/search/${encodeURIComponent(query)}?scope=all`;
      const html = await fetchHtml(url, signal);
      return extractGenericCards(html, {
        source: "thangs",
        baseUrl: "https://thangs.com",
        itemUrlIncludes: ["/designer/", "/3d-model/"]
      });
    }
  },
  {
    id: "myminifactory",
    label: "MyMiniFactory",
    async search(query, _filters, signal) {
      const url = `https://www.myminifactory.com/search/?query=${encodeURIComponent(query)}`;
      const html = await fetchHtml(url, signal);
      return extractGenericCards(html, {
        source: "myminifactory",
        baseUrl: "https://www.myminifactory.com",
        itemUrlIncludes: ["/object/3d-print-"]
      });
    }
  },
  {
    id: "printables",
    label: "Printables",
    async search(query, _filters, signal) {
      const url = `https://www.printables.com/search/models?q=${encodeURIComponent(query)}`;
      const html = await fetchHtml(url, signal);
      return extractGenericCards(html, {
        source: "printables",
        baseUrl: "https://www.printables.com",
        itemUrlIncludes: ["/model/"]
      });
    }
  },
{
  id: "stlfinder",
  label: "STLFinder",
  async search(query, _filters, signal) {
    const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(
      `site:stlfinder.com/3dmodels ${query}`
    )}`;

    const html = await fetchHtml(searchUrl, signal);
    const $ = cheerio.load(html);
    const $ = cheerio.load(html);

    const results: any[] = [];

    $(".result__a").each((index, el) => {
      const title = $(el).text().trim();
      let href = $(el).attr("href");

      if (!title || !href) return;

      try {
        const parsed = new URL(href, "https://duckduckgo.com");
        const uddg = parsed.searchParams.get("uddg");
        if (uddg) href = decodeURIComponent(uddg);
      } catch {}

      if (!href.includes("stlfinder.com/3dmodels")) return;

      results.push({
        id: `stlfinder-${index}-${Buffer.from(href).toString("base64url")}`,
        source: "stlfinder",
        title,
        url: href,
        thumbnailUrl: "https://www.stlfinder.com/favicon.ico",
        isFree: undefined
      });
    });

    return results.slice(0, 12);
  }
},
  {
    id: "cults3d",
    label: "Cults3D",
    async search(query, _filters, signal) {
      const url = `https://cults3d.com/en/search?q=${encodeURIComponent(query)}`;
      const html = await fetchHtml(url, signal);
      return extractGenericCards(html, {
        source: "cults3d",
        baseUrl: "https://cults3d.com",
        itemUrlIncludes: ["/en/3d-model/"]
      });
    }
  }
];

export const sourceLabels = Object.fromEntries(adapters.map((adapter) => [adapter.id, adapter.label]));
