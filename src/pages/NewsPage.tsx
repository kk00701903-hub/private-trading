import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Minus, RefreshCw, ExternalLink, Wifi, WifiOff } from "lucide-react";
import { fetchNews, type NewsItem } from "@/lib/newsApi";
import { MOCK_NEWS, TARGET_PRICE_UPDATES } from "@/lib/constants";

const CATEGORIES = ["??", "??", "???", "???", "??", "2???", "????", "???", "???"];

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
              style={{ background: sentimentBg[s], border: `1px solid ${sentimentBorder[s]}` }}
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
                {news.relatedStocks.slice(0, 2).map((s) => (
                  <span
                    key={s}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)", color: "var(--primary)" }}
                  >
                    {s}
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
  const [activeCategory, setActiveCategory] = useState("??");
  const [activeTab, setActiveTab] = useState<"news" | "target">("news");

  const { data: news, isLoading, isError, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ["news"],
    queryFn: fetchNews,
  });

  const displayNews: NewsItem[] = news ?? (MOCK_NEWS as NewsItem[]);
  const isLive = !!news && !isError;

  const filteredNews = activeCategory === "??"
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
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>?? ??</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isLive ? (
                <Wifi size={11} color="#22c55e" />
              ) : (
                <WifiOff size={11} color="#eab308" />
              )}
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {isLive
                  ? `??? ?? ? ${lastUpdated ?? "???? ?"}${isFetching ? " ?" : ""}`
                  : "???? ? ?? ???"}
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
          {[{ id: "news", label: "?? ??? ??" }, { id: "target", label: "?? ??? ??" }].map(({ id, label }) => (
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
                ?? ?? API ?? ?? ? ?? ???? ?????. (??? API ? ??? ? ??)
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
                    <p className="text-sm">?? ????? ??? ????.</p>
                  </div>
                )
            }
          </div>
        </div>
      ) : (
        <div className="px-4 mt-3 space-y-3">
          <div className="rounded-xl px-4 py-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <p className="text-xs font-semibold" style={{ color: "#ef4444" }}>?? ?? ?? #15: ??? ??? 50% ???? ? ??? ??!</p>
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
                      {item.direction === "up" ? "? ??" : "? ??"}
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{item.analyst} ? {item.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {item.before.toLocaleString()}?
                  </p>
                  <p className="text-sm font-bold" style={{ color: item.direction === "up" ? "#22c55e" : "#ef4444" }}>
                    ? {item.after.toLocaleString()}?
                  </p>
                  <p className="text-xs font-semibold" style={{ color: item.direction === "up" ? "#22c55e" : "#ef4444" }}>
                    {item.direction === "up" ? "+" : ""}{(((item.after - item.before) / item.before) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              {item.direction === "down" && (
                <div className="mt-2 rounded-lg px-3 py-2" style={{ background: "rgba(239,68,68,0.08)" }}>
                  <p className="text-xs" style={{ color: "#dc2626" }}>?? ?? ??: ?? #14 &amp; #15 ?? ? ?? ?? ?? ??</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CSS for spin animation */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
