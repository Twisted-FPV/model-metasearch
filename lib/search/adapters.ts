import * as cheerio from "cheerio";
import type { ModelSearchResult, SourceAdapter } from "../types";
import { fetchHtml, stableId } from "./http";
import { extractGenericCards } from "./extract";

export const adapters: SourceAdapter[] = [
  {
  id: "makerworld",
  label: "MakerWorld",
  async search(query, _filters, signal) {
    const makerWorldUrl = `https://makerworld.com/en/search/models?isFromSearchList=true&keyword=${encodeURIComponent(query)}`;

    try {
      const ddgUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(
        `site:makerworld.com/en/models ${query}`
      )}`;

      const html = await fetchHtml(ddgUrl, signal);
      const $ = cheerio.load(html);

      const results: ModelSearchResult[] = [];

      $(".result__a").each((index, el) => {
        const title = $(el).text().replace(/\s+/g, " ").trim();
        let href = $(el).attr("href");

        if (!title || !href) return;

        try {
          const parsed = new URL(href, "https://duckduckgo.com");
          const uddg = parsed.searchParams.get("uddg");
          if (uddg) href = decodeURIComponent(uddg);
        } catch {
          return;
        }

        if (!href.includes("makerworld.com/en/models")) return;

        results.push({
          id: stableId("makerworld", href),
          source: "makerworld",
          title,
          url: href,
          thumbnailUrl: "https://makerworld.com/favicon.ico",
          isFree: undefined
        });
      });

      if (results.length > 0) return results.slice(0, 12);
    } catch {
      // MakerWorld blocks or renders results client-side.
    }

    return [
      {
        id: `makerworld-${Buffer.from(query).toString("base64url")}`,
        source: "makerworld",
        title: `Open MakerWorld search for "${query}"`,
        url: makerWorldUrl,
        thumbnailUrl: "https://makerworld.com/favicon.ico",
        isFree: undefined
      }
    ];
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

      try {
        const html = await fetchHtml(searchUrl, signal);
        const $ = cheerio.load(html);
        const results: ModelSearchResult[] = [];

        $(".result__a").each((index, el) => {
          const title = $(el).text().replace(/\s+/g, " ").trim();
          let href = $(el).attr("href");

          if (!title || !href) return;

          try {
            const parsed = new URL(href, "https://duckduckgo.com");
            const uddg = parsed.searchParams.get("uddg");
            if (uddg) href = decodeURIComponent(uddg);
          } catch {
            return;
          }

          if (!href.includes("stlfinder.com/3dmodels")) return;

          results.push({
            id: stableId("stlfinder", href),
            source: "stlfinder",
            title,
            url: href,
            thumbnailUrl: "https://www.stlfinder.com/favicon.ico",
            isFree: undefined
          });
        });

        if (results.length > 0) {
          return results.slice(0, 12);
        }
      } catch {
        // STLFinder/DuckDuckGo may block server-side requests.
      }

      return [
        {
          id: `stlfinder-${Buffer.from(query).toString("base64url")}`,
          source: "stlfinder",
          title: `Open STLFinder search for "${query}"`,
          url: `https://www.stlfinder.com/3dmodels?search=${encodeURIComponent(query)}`,
          thumbnailUrl: "https://www.stlfinder.com/favicon.ico",
          isFree: undefined
        }
      ];
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

export const sourceLabels = Object.fromEntries(
  adapters.map((adapter) => [adapter.id, adapter.label])
);
