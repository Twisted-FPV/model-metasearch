export async function fetchHtml(url: string, signal: AbortSignal): Promise<string> {
  const response = await fetch(url, {
    signal,
    headers: {
      "user-agent": process.env.USER_AGENT ?? "ModelMetasearchBot/0.1",
      "accept": "text/html,application/xhtml+xml"
    },
    next: { revalidate: 300 }
  });

  if (!response.ok) {
    throw new Error(`Fetch failed ${response.status} for ${url}`);
  }

  return response.text();
}

export function absolutize(href: string | undefined, baseUrl: string): string | undefined {
  if (!href) return undefined;
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return undefined;
  }
}

export function stableId(source: string, url: string): string {
  let hash = 0;
  const value = `${source}:${url}`;
  for (let i = 0; i < value.length; i++) {
    hash = Math.imul(31, hash) + value.charCodeAt(i) | 0;
  }
  return `${source}-${Math.abs(hash)}`;
}
