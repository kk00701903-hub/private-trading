import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const NAVER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
  "Referer": "https://m.stock.naver.com/",
  "Accept": "application/json",
};

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

function relativeTime(pubDate: string): string {
  const now = Date.now();
  const pub = new Date(pubDate).getTime();
  if (isNaN(pub)) return pubDate;
  const mins = Math.floor((now - pub) / 60000);
  if (mins < 60) return `${mins}\uBD84 \uC804`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}\uC2DC\uAC04 \uC804`;
  return `${Math.floor(hours / 24)}\uC77C \uC804`;
}

/** Search Naver Finance for ticker code by stock name */
async function searchTicker(query: string): Promise<{ name: string; ticker: string } | null> {
  try {
    const url = `https://ac.finance.naver.com/ac?q=${encodeURIComponent(query)}&st=stock&target=stock,index`;
    const res = await fetch(url, { headers: NAVER_HEADERS });
    if (!res.ok) return null;
    const data = await res.json();
    // items: [[name, ticker, type, ...], ...]
    const items = data.items as string[][];
    if (!items || items.length === 0) return null;
    // Prefer exact name match, else first result
    const exact = items.find((i) => i[0] === query);
    const best = exact ?? items[0];
    return { name: best[0], ticker: best[1] };
  } catch {
    return null;
  }
}

/** Fetch stock basic data from Naver mobile API */
async function fetchStockBasic(ticker: string): Promise<Record<string, unknown> | null> {
  try {
    const url = `https://m.stock.naver.com/api/stock/${ticker}/basic`;
    const res = await fetch(url, { headers: NAVER_HEADERS });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Extract a value from totalInfos array by key */
function getInfo(totalInfos: Array<{ key: string; value: string }>, key: string): string | null {
  const found = totalInfos?.find((i) => i.key === key);
  return found?.value ?? null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  try {
    const body = await req.json();
    const { stockName, ticker: providedTicker } = body as { stockName: string; ticker?: string };

    // Step 1: Resolve ticker
    let ticker = providedTicker ?? "";
    let resolvedName = stockName;

    if (!ticker) {
      const found = await searchTicker(stockName);
      if (found) {
        ticker = found.ticker;
        resolvedName = found.name;
      }
    }

    // Step 2: Fetch stock price data
    let priceContext = "\uC2E4\uC2DC\uAC04 \uC8FC\uAC00 \uB370\uC774\uD130 \uBD88\uAC00";
    const basic = ticker ? await fetchStockBasic(ticker) : null;

    if (basic) {
      const totalInfos = (basic.totalInfos ?? []) as Array<{ key: string; value: string }>;
      const closePrice = basic.closePrice as string ?? "";
      const change = basic.compareToPreviousClosePrice as string ?? "";
      const changeRate = basic.fluctuationsRatio as string ?? "";
      const market = (basic.stockExchangeType as { shortName?: string } | undefined)?.shortName ?? "";
      const per = getInfo(totalInfos, "PER");
      const pbr = getInfo(totalInfos, "PBR");
      const high52 = getInfo(totalInfos, "52\uC8FC \uCD5C\uACE0");
      const low52 = getInfo(totalInfos, "52\uC8FC \uCD5C\uC800");
      const marketCap = getInfo(totalInfos, "\uC2DC\uAC00\uCD1D\uC561");
      const foreignRatio = getInfo(totalInfos, "\uc678\uad6d\uc778\ud55c\ub3c4\ube44\uc728");

      const sign = parseFloat(changeRate) >= 0 ? "+" : "";
      priceContext = [
        `\uD1B1\uD654\uBA85: ${resolvedName}${ticker ? ` (${ticker})` : ""} | \uC2DC\uC7A5: ${market}`,
        `\uD604\uC7AC\uAC00: ${closePrice}\uC6D0 | \uC804\uC77C \uB300\uBE44: ${sign}${change}\uC6D0 (${sign}${changeRate}%)`,
        per ? `PER: ${per}\uBC30 | PBR: ${pbr}\uBC30` : "",
        marketCap ? `\uC2DC\uAC00\uCD1D\uC561: ${marketCap}` : "",
        high52 ? `52\uC8FC \uCD5C\uACE0: ${high52}\uC6D0 | 52\uC8FC \uCD5C\uC800: ${low52}\uC6D0` : "",
        foreignRatio ? `\uc678\uad6d\uc778\ud55c\ub3c4: ${foreignRatio}` : "",
        `\uB370\uC774\uD130 \uAE30\uC900: ${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}`,
      ].filter(Boolean).join("\n");
    }

    // Step 3: Fetch recent news (Naver Search API if key available)
    const clientId = Deno.env.get("NAVER_CLIENT_ID");
    const clientSecret = Deno.env.get("NAVER_CLIENT_SECRET");
    let newsContext = "";

    if (clientId && clientSecret) {
      try {
        const newsUrl = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(stockName)}&display=5&sort=date`;
        const newsRes = await fetch(newsUrl, {
          headers: { "X-Naver-Client-Id": clientId, "X-Naver-Client-Secret": clientSecret },
        });
        if (newsRes.ok) {
          const newsData = await newsRes.json() as { items?: Array<{ title: string; description: string; pubDate: string; originallink: string }> };
          const items = newsData.items ?? [];
          if (items.length > 0) {
            newsContext = "\n\n[\uCD5C\uC2E0 \uB274\uC2A4 - \uB124\uC774\uBC84 \uAC80\uC0C9]\n" +
              items.map((n, i) =>
                `${i + 1}. ${stripHtml(n.title)} (${relativeTime(n.pubDate)})\n   ${stripHtml(n.description).slice(0, 100)}`
              ).join("\n");
          }
        }
      } catch {
        // news fetch failure is non-critical
      }
    }

    const fullContext = priceContext + newsContext;

    return new Response(JSON.stringify({
      ticker,
      name: resolvedName,
      context: fullContext,
      hasRealData: basic !== null,
    }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: `\uC11C\uBC84 \uC624\uB958: ${String(e)}`, context: "", hasRealData: false }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
