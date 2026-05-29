import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Maps portfolio stock names to their sector categories
const QUERY_CATEGORY_MAP: Record<string, string> = {
  "NICE평가정보": "시장",
  "SK바이오사이언스": "바이오",
  "한솔로지스틱스": "물류",
  "파워로직스": "2차전지",
  "아이스크림미디어": "에듀테크",
  "대동": "농기계",
  "코스피": "시장",
  "코스닥": "시장",
  "2차전지": "2차전지",
  "반도체": "글로벌",
};

// Stock display names for relatedStocks field
const QUERY_STOCK_NAME: Record<string, string> = {
  "NICE평가정보": "NICE",
  "SK바이오사이언스": "SK바이오사이언스",
  "한솔로지스틱스": "한솔로지스틱스",
  "파워로직스": "파워로직스",
  "아이스크림미디어": "아이스크림미디어",
  "대동": "대동",
};

const PORTFOLIO_STOCKS = ["NICE", "SK바이오사이언스", "한솔로지스틱스", "파워로직스", "아이스크림미디어", "대동"];

// Naver news source domain lookup
const DOMAIN_SOURCE_MAP: Record<string, string> = {
  "hankyung.com": "한국경제",
  "mk.co.kr": "매일경제",
  "edaily.co.kr": "이데일리",
  "sedaily.com": "서울경제",
  "biz.chosun.com": "조선비즈",
  "chosun.com": "조선일보",
  "news1.kr": "뉴스1",
  "mt.co.kr": "머니투데이",
  "inews24.com": "아이뉴스24",
  "etnews.com": "전자신문",
  "yna.co.kr": "연합뉴스",
  "yonhapnewstv.co.kr": "연합뉴스TV",
  "asiae.co.kr": "아시아경제",
  "wowtv.co.kr": "한국경제TV",
  "businesspost.co.kr": "비즈니스포스트",
  "thebell.co.kr": "더벨",
  "fnnews.com": "파이낸셜뉴스",
  "newspim.com": "뉴스핌",
  "khan.co.kr": "경향신문",
  "hani.co.kr": "한겨레",
  "zdnet.co.kr": "지디넷코리아",
  "heraldcorp.com": "헤럴드경제",
};

function extractSource(originallink: string): string {
  try {
    const hostname = new URL(originallink).hostname.replace(/^www\./, "");
    for (const [domain, source] of Object.entries(DOMAIN_SOURCE_MAP)) {
      if (hostname === domain || hostname.endsWith("." + domain)) return source;
    }
    return hostname.split(".")[0].toUpperCase();
  } catch {
    return "뉴스";
  }
}

function stripHtml(str: string): string {
  return str
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function detectCategory(title: string, query: string): string {
  if (title.includes("목표주가") || title.includes("목표가")) return "목표가";
  if (title.includes("바이오") || title.includes("백신") || title.includes("임상") || title.includes("신약")) return "바이오";
  if (title.includes("물류") || title.includes("로지스틱") || title.includes("풀필먼트") || title.includes("배송")) return "물류";
  if (title.includes("2차전지") || title.includes("배터리") || title.includes("BMS") || title.includes("전기차") || title.includes("파워로직스")) return "2차전지";
  if (title.includes("에듀") || title.includes("교육") || title.includes("아이스크림") || title.includes("에듀테크")) return "에듀테크";
  if (title.includes("농기계") || title.includes("농업") || title.includes("트랙터") || title.includes("스마트팜") || title.includes("대동")) return "농기계";
  if (title.includes("반도체") || title.includes("HBM") || title.includes("AI") || title.includes("메모리") || title.includes("GPU")) return "글로벌";
  if (title.includes("코스피") || title.includes("코스닥") || title.includes("증시") || title.includes("주식시장")) return "시장";

  return QUERY_CATEGORY_MAP[query] ?? "시장";
}

function detectSentiment(title: string): "positive" | "negative" | "neutral" {
  const pos = ["상승", "급등", "호재", "흑자", "성장", "확대", "돌파", "신고가", "상향", "수주", "개선", "기대", "유입", "반등", "회복", "선정", "지원", "확정"];
  const neg = ["하락", "급락", "악재", "적자", "축소", "손실", "부진", "하향", "우려", "조정", "감소", "후퇴", "투매", "매도", "하락세", "폭락"];
  const hasPos = pos.some((w) => title.includes(w));
  const hasNeg = neg.some((w) => title.includes(w));
  if (hasPos && !hasNeg) return "positive";
  if (hasNeg && !hasPos) return "negative";
  return "neutral";
}

function relativeTime(pubDate: string): string {
  const now = Date.now();
  const pub = new Date(pubDate).getTime();
  if (isNaN(pub)) return "방금 전";
  const mins = Math.floor((now - pub) / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

function getRelatedStocks(title: string, query: string): string[] {
  const found = PORTFOLIO_STOCKS.filter((s) => title.includes(s));
  if (found.length > 0) return found;
  const mapped = QUERY_STOCK_NAME[query];
  return mapped ? [mapped] : [];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const clientId = Deno.env.get("NAVER_CLIENT_ID");
    const clientSecret = Deno.env.get("NAVER_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ error: "NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 시크릿이 설정되지 않았습니다." }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const queries: string[] = body.queries ?? [];

    if (queries.length === 0) {
      return new Response(
        JSON.stringify({ items: [] }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Parallel fetch for all queries
    const results = await Promise.allSettled(
      queries.map(async (query) => {
        const url = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=5&sort=date`;
        const res = await fetch(url, {
          headers: {
            "X-Naver-Client-Id": clientId,
            "X-Naver-Client-Secret": clientSecret,
          },
        });
        if (!res.ok) return [];
        const data = await res.json();
        return ((data.items as unknown[]) ?? []).map((item) => ({
          ...(item as Record<string, string>),
          _query: query,
        }));
      })
    );

    // Flatten and deduplicate by original URL
    const seen = new Set<string>();
    const allItems: Array<Record<string, string>> = [];

    for (const result of results) {
      if (result.status === "fulfilled") {
        for (const item of result.value) {
          const key = item.originallink || item.link;
          if (key && !seen.has(key)) {
            seen.add(key);
            allItems.push(item);
          }
        }
      }
    }

    // Sort newest first
    allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    // Map to app news shape (top 20)
    const news = allItems.slice(0, 20).map((item, idx) => {
      const title = stripHtml(item.title ?? "");
      const query = item._query ?? "";
      return {
        id: idx + 1,
        title,
        source: extractSource(item.originallink ?? item.link ?? ""),
        time: relativeTime(item.pubDate ?? ""),
        link: item.originallink || item.link || "",
        category: detectCategory(title, query),
        sentiment: detectSentiment(title),
        relatedStocks: getRelatedStocks(title, query),
      };
    });

    return new Response(JSON.stringify({ items: news }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: `서버 오류: ${String(e)}` }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
