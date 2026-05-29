import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, RefreshCw, ExternalLink } from "lucide-react";
import { MOCK_NEWS, TARGET_PRICE_UPDATES } from "@/lib/constants";

const CATEGORIES = ["전체", "시장", "목표가", "바이오", "물류", "2차전지", "에듀테크", "농기계", "글로벌"];

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState("전체");
  const [activeTab, setActiveTab] = useState<"news" | "target">("news");

  const filteredNews = activeCategory === "전체"
    ? MOCK_NEWS
    : MOCK_NEWS.filter((n) => n.category === activeCategory);

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

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-4 pt-safe pb-3" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 20%, var(--background)) 0%, var(--background) 100%)" }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>시장 뉴스</h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>2026.05.29 · 실시간 업데이트</p>
          </div>
          <button className="p-2 rounded-xl" style={{ background: "var(--muted)" }}>
            <RefreshCw size={16} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-3">
          {[{ id: "news", label: "📰 최신 뉴스" }, { id: "target", label: "🎯 목표가 변경" }].map(({ id, label }) => (
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
            {filteredNews.map((news) => (
              <div
                key={news.id}
                className="rounded-2xl p-4 transition-all duration-150 active:scale-[0.98]"
                style={{ background: "var(--card)", border: `1px solid var(--border)` }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                        background: sentimentBg[news.sentiment as keyof typeof sentimentBg],
                        border: `1px solid ${sentimentBorder[news.sentiment as keyof typeof sentimentBorder]}`,
                      }}>
                        <span className="flex items-center gap-1">
                          {sentimentIcon[news.sentiment as keyof typeof sentimentIcon]}
                          <span style={{ color: news.sentiment === "positive" ? "#22c55e" : news.sentiment === "negative" ? "#ef4444" : "#eab308" }}>
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
                            <span key={s} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)", color: "var(--primary)" }}>
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
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 mt-3 space-y-3">
          <div className="rounded-xl px-4 py-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <p className="text-xs font-semibold" style={{ color: "#ef4444" }}>⚠️ 투자 규칙 #15: 목표가 낮추면 50% 떨어진다 — 무조건 판다!</p>
          </div>
          {TARGET_PRICE_UPDATES.map((item, idx) => (
            <div key={idx} className="rounded-2xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base" style={{ color: "var(--foreground)" }}>{item.stock}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold`} style={{
                      background: item.direction === "up" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                      color: item.direction === "up" ? "#22c55e" : "#ef4444",
                    }}>
                      {item.direction === "up" ? "▲ 상향" : "▼ 하향"}
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{item.analyst} · {item.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {item.before.toLocaleString()}원
                  </p>
                  <p className="text-sm font-bold" style={{ color: item.direction === "up" ? "#22c55e" : "#ef4444" }}>
                    → {item.after.toLocaleString()}원
                  </p>
                  <p className="text-xs font-semibold" style={{ color: item.direction === "up" ? "#22c55e" : "#ef4444" }}>
                    {item.direction === "up" ? "+" : ""}{(((item.after - item.before) / item.before) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              {item.direction === "down" && (
                <div className="mt-2 rounded-lg px-3 py-2" style={{ background: "rgba(239,68,68,0.08)" }}>
                  <p className="text-xs" style={{ color: "#dc2626" }}>🚨 매도 신호: 규칙 #14 &amp; #15 적용 — 탈출 전략 검토 필요</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
