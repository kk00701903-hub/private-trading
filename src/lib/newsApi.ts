import { MOCK_NEWS } from "./constants";

export interface NewsItem {
  id: number;
  title: string;
  source: string;
  time: string;
  link?: string;
  category: string;
  sentiment: "positive" | "negative" | "neutral";
  relatedStocks: string[];
}

// Portfolio stocks + market keywords sent to the edge function
const NEWS_QUERIES = [
  "NICE평가정보",
  "SK바이오사이언스",
  "한솔로지스틱스",
  "파워로직스",
  "아이스크림미디어",
  "대동 농기계",
  "코스피",
  "코스닥",
  "2차전지",
  "반도체",
];

function getSupabaseUrl(): string {
  return localStorage.getItem("supabase_url") || import.meta.env.VITE_SUPABASE_URL || "";
}

function getAnonKey(): string {
  return localStorage.getItem("supabase_anon_key") || import.meta.env.VITE_SUPABASE_ANON_KEY || "";
}

export async function fetchNews(): Promise<NewsItem[]> {
  const supabaseUrl = getSupabaseUrl();
  const anonKey = getAnonKey();

  if (!supabaseUrl || !anonKey) {
    return MOCK_NEWS as NewsItem[];
  }

  const edgeUrl = `${supabaseUrl.replace(/\/$/,  "")}/functions/v1/naver-news`;

  const res = await fetch(edgeUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify({ queries: NEWS_QUERIES }),
  });

  if (!res.ok) {
    throw new Error(`뉴스 API 오류: HTTP ${res.status}`);
  }

  const data: { items?: NewsItem[]; error?: string } = await res.json();

  if (data.error) {
    throw new Error(data.error);
  }

  const items = data.items ?? [];
  return items.length > 0 ? items : (MOCK_NEWS as NewsItem[]);
}
