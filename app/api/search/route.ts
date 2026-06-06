import { NextResponse } from "next/server";
import { z } from "zod";
import { searchAll } from "../../../lib/search";
import { adapters } from "../../../lib/search/adapters";

const schema = z.object({
  q: z.string().min(1).max(120),
  sources: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional()
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = schema.safeParse({
    q: url.searchParams.get("q"),
    sources: url.searchParams.get("sources") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid search parameters" }, { status: 400 });
  }

  const validSources = new Set(adapters.map((adapter) => adapter.id));
  const sources = parsed.data.sources
    ?.split(",")
    .map((source) => source.trim())
    .filter((source): source is typeof adapters[number]["id"] => validSources.has(source as any));

  const payload = await searchAll(parsed.data.q, {
    sources,
    limit: parsed.data.limit
  });

  return NextResponse.json(payload);
}
