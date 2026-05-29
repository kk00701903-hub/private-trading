import { writeFileSync } from "fs";

// newsApi.ts — Korean strings as Unicode escapes to avoid encoding issues
const newsApiContent = `import { MOCK_NEWS } from "./constants";

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
  "NICE\uD3C9\uAC00\uC815\uBCF4",
  "SK\uBC14\uC774\uC624\uC0AC\uC774\uC5B8\uC2A4",
  "\uD55C\uC194\uB85C\uC9C0\uC2A4\uD2F1\uC2A4",
  "\uD30C\uC6CC\uB85C\uC9C1\uC2A4",
  "\uC544\uC774\uC2A4\uD06C\uB9BC\uBBF8\uB514\uC5B4",
  "\uB300\uB3D9 \uB18D\uAE30\uACC4",
  "\uCF54\uC2A4\uD53C",
  "\uCF54\uC2A4\uB2E5",
  "2\uCC28\uC804\uC9C0",
  "\uBC18\uB3C4\uCCB4",
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

  const edgeUrl = \`\${supabaseUrl.replace(/\\/$/,  "")}/functions/v1/naver-news\`;

  const res = await fetch(edgeUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: anonKey,
      Authorization: \`Bearer \${anonKey}\`,
    },
    body: JSON.stringify({ queries: NEWS_QUERIES }),
  });

  if (!res.ok) {
    throw new Error(\`\uB274\uC2A4 API \uC624\uB958: HTTP \${res.status}\`);
  }

  const data: { items?: NewsItem[]; error?: string } = await res.json();

  if (data.error) {
    throw new Error(data.error);
  }

  const items = data.items ?? [];
  return items.length > 0 ? items : (MOCK_NEWS as NewsItem[]);
}
`;

// NewsPage.tsx — all Korean strings as Unicode escapes
const newsPageContent = `import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Minus, RefreshCw, ExternalLink, Wifi, WifiOff } from "lucide-react";
import { fetchNews, type NewsItem } from "@/lib/newsApi";
import { MOCK_NEWS, TARGET_PRICE_UPDATES } from "@/lib/constants";

const CATEGORIES = [
  "\uC804\uCCB4",
  "\uC2DC\uC7A5",
  "\uBAA9\uD45C\uAC00",
  "\uBC14\uC774\uC624",
  "\uBB3C\uB958",
  "2\uCC28\uC804\uC9C0",
  "\uC5D0\uB4C0\uD14C\uD06C",
  "\uB18D\uAE30\uACC4",
  "\uAE00\uB85C\uBC8C",
];

const sentimentIcon = {
  positive: <TrendingUp size={14} color="#22c55e" />,
  negative: <TrendingDown size={14} color="#ef4444" />,
  neutral: <Minus size={14} color="#eab308" />,
};
const sentimentBg = {
  positive: "rgba(34,197,94,0.1)",
  negative: "rgba(239,68,68,0.1)",
  neutral: "rgba(234,179,8,0.1)",
};
const sentimentBorder = {
  positive: "rgba(34,197,94,0.3)",
  negative: "rgba(239,68,68,0.3)",
  neutral: "rgba(234,179,8,0.3)",
};

function NewsCardSkeleton() {
  return (
    <div className="rounded-2xl p-4 animate-pulse" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-5 w-16 rounded-full" style={{ background: "var(--muted)" }} />
            <div className="h-4 w-12 rounded" style={{ background: "var(--muted)" }} />
          </div>
          <div className="h-4 w-full rounded" style={{ background: "var(--muted)" }} />
          <div className="h-4 w-3/4 rounded" style={{ background: "var(--muted)" }} />
          <div className="flex justify-between pt-1">
            <div className="h-3 w-16 rounded" style={{ background: "var(--muted)" }} />
            <div className="h-5 w-20 rounded-full" style={{ background: "var(--muted)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function NewsCard({ news }: { news: NewsItem }) {
  const s = news.sentiment as keyof typeof sentimentIcon;
  const content = (
    <div
      className="rounded-2xl p-4 transition-all duration-150 active:scale-[0.98]"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: sentimentBg[s], border: \`1px solid \${sentimentBorder[s]}\` }}
            >
              <span className="flex items-center gap-1">
                {sentimentIcon[s]}
                <span style={{ color: s === "positive" ? "#22c55e" : s === "negative" ? "#ef4444" : "#eab308" }}>
                  {news.category}
                </span>
              </span>
            </span>
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{news.time}</span>
          </div>
          <p className="text-sm font-semibold leading-snug" style={{ color: "var(--foreground)" }}>{news.title}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{news.source}</span>
            {news.relatedStocks.length > 0 && (
              <div className="flex gap-1">
                {news.relatedStocks.slice(0, 2).map((st) => (
                  <span
                    key={st}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)", color: "var(--primary)" }}
                  >
                    {st}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <ExternalLink size={14} style={{ color: "var(--muted-foreground)", marginTop: 2, flexShrink: 0 }} />
      </div>
    </div>
  );

  if (news.link) {
    return (
      <a href={news.link} target="_blank" rel="noopener noreferrer" className="block no-underline">
        {content}
      </a>
    );
  }
  return content;
}

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState("\uC804\uCCB4");
  const [activeTab, setActiveTab] = useState<"news" | "target">("news");

  const { data: news, isLoading, isError, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ["news"],
    queryFn: fetchNews,
  });

  const displayNews: NewsItem[] = news ?? (MOCK_NEWS as NewsItem[]);
  const isLive = !!news && !isError;

  const filteredNews = activeCategory === "\uC804\uCCB4"
    ? displayNews
    : displayNews.filter((n) => n.category === activeCategory);

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div
        className="px-4 pt-safe pb-3"
        style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 20%, var(--background)) 0%, var(--background) 100%)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>\uC2DC\uC7A5 \uB274\uC2A4</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isLive ? (
                <Wifi size={11} color="#22c55e" />
              ) : (
                <WifiOff size={11} color="#eab308" />
              )}
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {isLive
                  ? \`\uB124\uC774\uBC84 \uB274\uC2A4 \u00B7 \${lastUpdated ?? "\uC5C5\uB370\uC774\uD2B8 \uC911"}\${isFetching ? " \u21BB" : ""}\`
                  : "\uC624\uD504\uB77C\uC778 \u00B7 \uCE90\uC2DC \uB370\uC774\uD130"}
              </p>
            </div>
          </div>
          <button
            className="p-2 rounded-xl transition-transform active:scale-90"
            style={{ background: "var(--muted)" }}
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              size={16}
              style={{
                color: "var(--muted-foreground)",
                animation: isFetching ? "spin 1s linear infinite" : "none",
              }}
            />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-3">
          {[
            { id: "news", label: "\uD83D\uDCF0 \uC2E4\uC2DC\uAC04 \uB274\uC2A4" },
            { id: "target", label: "\uD83C\uDFAF \uBAA9\uD45C\uAC00 \uBCC0\uACBD" },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as "news" | "target")}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: activeTab === id ? "var(--primary)" : "var(--muted)",
                color: activeTab === id ? "var(--primary-foreground)" : "var(--muted-foreground)",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "news" ? (
        <div className="flex flex-col">
          {/* Error banner */}
          {isError && (
            <div className="mx-4 mt-3 rounded-xl px-4 py-2.5" style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.25)" }}>
              <p className="text-xs" style={{ color: "#ca8a04" }}>
                \u26A0\uFE0F \uB274\uC2A4 API \uC5F0\uACB0 \uC2E4\uD328 \u2014 \uCE90\uC2DC \uB370\uC774\uD130\uB97C \uD45C\uC2DC\uD569\uB2C8\uB2E4. (\uB124\uC774\uBC84 API \uD0A4 \uBBF8\uC124\uC815 \uC2DC \uC815\uC0C1)
              </p>
            </div>
          )}

          {/* Category Filter */}
          <div className="px-4 py-2">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150"
                  style={{
                    background: activeCategory === cat ? "var(--primary)" : "var(--muted)",
                    color: activeCategory === cat ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* News List */}
          <div className="px-4 space-y-3 mt-1">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <NewsCardSkeleton key={i} />)
              : filteredNews.length > 0
                ? filteredNews.map((item) => <NewsCard key={item.id} news={item} />)
                : (
                  <div className="text-center py-10" style={{ color: "var(--muted-foreground)" }}>
                    <p className="text-sm">\uD574\uB2F9 \uCE74\uD14C\uACE0\uB9AC\uC758 \uB274\uC2A4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.</p>
                  </div>
                )
            }
          </div>
        </div>
      ) : (
        <div className="px-4 mt-3 space-y-3">
          <div className="rounded-xl px-4 py-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <p className="text-xs font-semibold" style={{ color: "#ef4444" }}>
              \u26A0\uFE0F \uD22C\uC790 \uADDC\uCE59 #15: \uBAA9\uD45C\uAC00 \uB099\uCD94\uBA74 50% \uB5A8\uC5B4\uC9C4\uB2E4 \u2192 \uBB34\uC870\uAC74 \uD310\uB2E4!
            </p>
          </div>
          {TARGET_PRICE_UPDATES.map((item, idx) => (
            <div key={idx} className="rounded-2xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base" style={{ color: "var(--foreground)" }}>{item.stock}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{
                        background: item.direction === "up" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                        color: item.direction === "up" ? "#22c55e" : "#ef4444",
                      }}
                    >
                      {item.direction === "up" ? "\u25B2 \uC0C1\uD5A5" : "\u25BC \uD558\uD5A5"}
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{item.analyst} \u00B7 {item.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {item.before.toLocaleString()}\uC6D0
                  </p>
                  <p className="text-sm font-bold" style={{ color: item.direction === "up" ? "#22c55e" : "#ef4444" }}>
                    \u2192 {item.after.toLocaleString()}\uC6D0
                  </p>
                  <p className="text-xs font-semibold" style={{ color: item.direction === "up" ? "#22c55e" : "#ef4444" }}>
                    {item.direction === "up" ? "+" : ""}{(((item.after - item.before) / item.before) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              {item.direction === "down" && (
                <div className="mt-2 rounded-lg px-3 py-2" style={{ background: "rgba(239,68,68,0.08)" }}>
                  <p className="text-xs" style={{ color: "#dc2626" }}>
                    \uD83D\uDEA8 \uB9E4\uB3C4 \uC2E0\uD638: \uADDC\uCE59 #14 &amp; #15 \uC801\uC6A9 \u2192 \uCD5C\uC120 \uC804\uB7B5 \uAC80\uD1A0 \uD544\uC694
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{\`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      \`}</style>
    </div>
  );
}
`;

writeFileSync("src/lib/newsApi.ts", newsApiContent, "utf8");
writeFileSync("src/pages/NewsPage.tsx", newsPageContent, "utf8");
console.log("Files written with proper UTF-8 encoding.");
