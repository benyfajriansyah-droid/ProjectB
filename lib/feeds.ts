/**
 * News and market data from free sources.
 *
 * Every fetch is individually guarded: one dead feed shows an empty section,
 * it never takes the dashboard down with it.
 */

export type NewsItem = { title: string; link: string; source: string };

export type Rate = { label: string; value: string; change: number | null };

const NEWS_SOURCES: { name: string; url: string }[] = [
  { name: "CNBC Indonesia", url: "https://www.cnbcindonesia.com/market/rss" },
  { name: "Kontan", url: "https://investasi.kontan.co.id/rss" },
  { name: "Antara Ekonomi", url: "https://www.antaranews.com/rss/ekonomi.xml" },
];

const FETCH_TIMEOUT_MS = 6000;

async function fetchWithTimeout(url: string): Promise<Response | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 900 },
      headers: { "user-agent": "ContentHub/1.0" },
    });
    clearTimeout(timer);
    return res.ok ? res : null;
  } catch {
    return null;
  }
}

function decodeEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

/** Minimal RSS reader — enough for <item><title>/<link>, no XML dependency. */
function parseRss(xml: string, source: string, limit: number): NewsItem[] {
  const items: NewsItem[] = [];
  const blocks = xml.split(/<item[\s>]/i).slice(1);

  for (const block of blocks.slice(0, limit)) {
    const title = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
    const link = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1];
    if (!title || !link) continue;
    items.push({
      title: decodeEntities(title),
      link: decodeEntities(link),
      source,
    });
  }
  return items;
}

export async function getNews(perSource = 4): Promise<NewsItem[]> {
  const results = await Promise.all(
    NEWS_SOURCES.map(async (src) => {
      const res = await fetchWithTimeout(src.url);
      if (!res) return [];
      try {
        return parseRss(await res.text(), src.name, perSource);
      } catch {
        return [];
      }
    }),
  );

  // Interleave sources so one prolific feed doesn't fill the whole list.
  const merged: NewsItem[] = [];
  for (let i = 0; i < perSource; i++) {
    for (const list of results) {
      if (list[i]) merged.push(list[i]);
    }
  }
  return merged;
}

type CoinGeckoResponse = Record<string, { usd?: number; usd_24h_change?: number }>;
type ForexResponse = { rates?: Record<string, number> };

export async function getMarkets(): Promise<Rate[]> {
  const rates: Rate[] = [];

  const forex = await fetchWithTimeout("https://open.er-api.com/v6/latest/USD");
  if (forex) {
    try {
      const data = (await forex.json()) as ForexResponse;
      const idr = data.rates?.IDR;
      if (idr) {
        rates.push({
          label: "USD / IDR",
          value: new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(idr),
          change: null,
        });
      }
    } catch {
      /* leave it out rather than fail the panel */
    }
  }

  const crypto = await fetchWithTimeout(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true",
  );
  if (crypto) {
    try {
      const data = (await crypto.json()) as CoinGeckoResponse;
      for (const [id, label] of [
        ["bitcoin", "Bitcoin"],
        ["ethereum", "Ethereum"],
      ] as const) {
        const price = data[id]?.usd;
        if (price === undefined) continue;
        rates.push({
          label,
          value: `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(price)}`,
          change: data[id]?.usd_24h_change ?? null,
        });
      }
    } catch {
      /* same: partial data beats no panel */
    }
  }

  return rates;
}
