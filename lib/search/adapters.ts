import type { SourceAdapter } from "../types";
import { fetchHtml } from "./http";
import { extractGenericCards } from "./extract";

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
    const url = `https://www.stlfinder.com/3dmodels?search=${encodeURIComponent(query)}`;

    const html = await fetchHtml(url, signal);

    const results = extractGenericCards(html, {
      source: "stlfinder",
      baseUrl: "https://www.stlfinder.com",
      itemUrlIncludes: ["/3dmodels/"]
    });

    return results.length
      ? results
      : [
          {
            id: `stlfinder-${Buffer.from(query).toString("base64url")}`,
            source: "stlfinder",
            title: `Search STLFinder for "${query}"`,
            url,
            thumbnailUrl: "https://www.stlfinder.com/favicon.ico"
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

export const sourceLabels = Object.fromEntries(adapters.map((adapter) => [adapter.id, adapter.label]));
