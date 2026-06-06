"use client";

import { FormEvent, useMemo, useState } from "react";
import type { ModelSearchResult, SourceId } from "../lib/types";

const SOURCES: Array<{ id: SourceId; label: string }> = [
  { id: "makerworld", label: "MakerWorld" },
  { id: "thangs", label: "Thangs" },
  { id: "myminifactory", label: "MyMiniFactory" },
  { id: "printables", label: "Printables" },
  { id: "stlfinder", label: "STLFinder" },
  { id: "cults3d", label: "Cults3D" }
];

type SearchResponse = {
  query: string;
  results: ModelSearchResult[];
  errors: Array<{ source: string; message: string }>;
};

export default function HomePage() {
  const [query, setQuery] = useState("benchy");
  const [selected, setSelected] = useState<SourceId[]>(SOURCES.map((source) => source.id));
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sourceParam = useMemo(() => selected.join(","), [selected]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&sources=${sourceParam}&limit=72`);
      if (!response.ok) throw new Error(`Search failed with ${response.status}`);
      setData(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  function toggleSource(id: SourceId) {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  }

  return (
    <main>
      <section className="hero">
        <div className="badge">Unified 3D model search</div>
        <h1>Find printable models across every major library.</h1>
        <p>
          Search MakerWorld, Thangs, MyMiniFactory, Printables, STLFinder, Cults3D, and add more
          sources by dropping in a new adapter.
        </p>
      </section>

      <form onSubmit={submit}>
        <div className="search">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for benchy, gridfinity, articulated dragon..."
          />
          <button disabled={loading || selected.length === 0}>{loading ? "Searching" : "Search"}</button>
        </div>

        <div className="sources">
          {SOURCES.map((source) => (
            <label className={`source ${selected.includes(source.id) ? "active" : ""}`} key={source.id}>
              <input
                type="checkbox"
                checked={selected.includes(source.id)}
                onChange={() => toggleSource(source.id)}
              />
              {source.label}
            </label>
          ))}
        </div>
      </form>

      {error && <div className="error">{error}</div>}

      {!data && !error && (
        <div className="empty">Run a search to see unified results from all enabled sources.</div>
      )}

      {data && data.results.length === 0 && (
        <div className="empty">No results found. Some sites may block server-side fetching or require official API access.</div>
      )}

      {data && data.results.length > 0 && (
        <section className="grid">
          {data.results.map((result) => (
            <a className="card" href={result.url} target="_blank" rel="noreferrer" key={result.id}>
              {result.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="thumb" src={result.thumbnailUrl} alt="" />
              ) : (
                <div className="thumb" />
              )}
              <div className="content">
                <div className="title">{result.title}</div>
                <div className="meta">
                  <span>{labelFor(result.source)}</span>
                  <span>{result.isFree === true ? "Free" : result.isFree === false ? "Paid" : "Open"}</span>
                </div>
              </div>
            </a>
          ))}
        </section>
      )}

      <div className="footer">
        Production tip: use official APIs where available and cache responses to avoid hammering source sites.
      </div>
    </main>
  );
}

function labelFor(source: SourceId): string {
  return SOURCES.find((item) => item.id === source)?.label ?? source;
}
