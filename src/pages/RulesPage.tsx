import { useState } from "react";
import { INVESTMENT_RULES, CATEGORIES } from "@/lib/constants";

export default function RulesPage() {
  const [activeCategory, setActiveCategory] = useState("전체");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = activeCategory === "전체"
    ? INVESTMENT_RULES
    : INVESTMENT_RULES.filter((r) => r.category === activeCategory);

  const catColors: Record<string, string> = {
    "매수 원칙": "#22c55e",
    "매수 타이밍": "#3b82f6",
    "매수 금지": "#ef4444",
    "매도 원칙": "#f97316",
    "종목 선정": "#8b5cf6",
    "계절 주의": "#06b6d4",
    "기타": "#6b7280",
  };

  const catCounts = CATEGORIES.slice(1).map((c) => ({
    cat: c,
    count: INVESTMENT_RULES.filter((r) => r.category === c).length,
  }));

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-4 pt-safe pb-4" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 20%, var(--background)) 0%, var(--background) 100%)" }}>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>나의 투자 규칙</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>직접 터득한 22개 원칙 · 매수·매도·종목 선정 기준</p>
      </div>

      {/* Summary Cards */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "전체", count: 22, color: "var(--primary)" },
            { label: "매수 금지", count: INVESTMENT_RULES.filter(r => r.category === "매수 금지").length, color: "#ef4444" },
            { label: "매도 원칙", count: INVESTMENT_RULES.filter(r => r.category === "매도 원칙").length, color: "#f97316" },
          ].map(({ label, count, color }) => (
            <div key={label} className="rounded-xl p-3 text-center" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <p className="text-2xl font-bold" style={{ color }}>{count}</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategory("전체")}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: activeCategory === "전체" ? "var(--primary)" : "var(--muted)",
              color: activeCategory === "전체" ? "var(--primary-foreground)" : "var(--muted-foreground)",
            }}
          >
            전체 22
          </button>
          {catCounts.map(({ cat, count }) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: activeCategory === cat ? catColors[cat] : "var(--muted)",
                color: activeCategory === cat ? "#fff" : "var(--muted-foreground)",
              }}
            >
              {cat} {count}
            </button>
          ))}
        </div>
      </div>

      {/* Rules List */}
      <div className="px-4 space-y-2 mt-1">
        {filtered.map((rule) => {
          const isExpanded = expandedId === rule.id;
          const color = catColors[rule.category] || "#6b7280";
          return (
            <button
              key={rule.id}
              onClick={() => setExpandedId(isExpanded ? null : rule.id)}
              className="w-full text-left rounded-2xl overflow-hidden transition-all duration-200"
              style={{ background: "var(--card)", border: `1px solid ${isExpanded ? color + "66" : "var(--border)"}` }}
            >
              <div className="px-4 py-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base" style={{ background: color + "20" }}>
                  {rule.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: color + "20", color }}>
                      {rule.category}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>#{rule.id}</span>
                  </div>
                  <p className="text-sm font-semibold leading-snug" style={{ color: "var(--foreground)" }}>{rule.rule}</p>
                  {isExpanded && (
                    <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{rule.detail}</p>
                  )}
                </div>
                <span className="text-lg flex-shrink-0">{isExpanded ? "▲" : "▼"}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Tip */}
      <div className="px-4 py-4 mt-2">
        <div className="rounded-xl p-4" style={{ background: "color-mix(in srgb, var(--primary) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--primary) 20%, transparent)" }}>
          <p className="text-xs font-semibold mb-1" style={{ color: "var(--primary)" }}>💡 AI 분석 탭 활용 팁</p>
          <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            종목을 입력하면 이 22개 규칙을 모두 체크하여 AI가 매수/홀드/매도를 판단합니다. 설정에서 Claude API 키를 입력해주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
