import { useState } from "react";
import { TrendingDown, AlertTriangle, Loader2, ChevronRight } from "lucide-react";
import { PORTFOLIO_DATA, TOTAL_PORTFOLIO } from "@/lib/constants";
import { analyzeSellTiming, AnalysisResult } from "@/lib/claudeApi";

export default function PortfolioPage() {
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, AnalysisResult>>({});

  const handleSellAnalysis = async (stock: { name: string; profitRate: number; profit: number }) => {
    setAnalyzing(stock.name);
    const res = await analyzeSellTiming(stock);
    setResults((prev) => ({ ...prev, [stock.name]: res }));
    setAnalyzing(null);
  };

  const verdictColor = { buy: "#22c55e", hold: "#eab308", sell: "#ef4444" };
  const verdictLabel = { buy: "매수", hold: "홀드", sell: "매도" };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-4 pt-safe pb-4" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 20%, var(--background)) 0%, var(--background) 100%)" }}>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>내 포트폴리오</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>토스증권 기준 · 2026.05.30</p>
      </div>

      <div className="px-4 space-y-4">
        {/* 총 평가 카드 */}
        <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 4px 20px color-mix(in srgb, var(--primary) 8%, transparent)" }}>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>총 평가금액</p>
          <p className="text-3xl font-bold mt-1" style={{ color: "var(--foreground)", fontFamily: "'JetBrains Mono', monospace" }}>
            {TOTAL_PORTFOLIO.evalAmount.toLocaleString()}
            <span className="text-base ml-1 font-medium">원</span>
          </p>
          <div className="flex items-center gap-2 mt-2">
            <TrendingDown size={16} color="#ef4444" />
            <span className="text-sm font-semibold" style={{ color: "#ef4444" }}>
              {TOTAL_PORTFOLIO.profit.toLocaleString()}원 ({TOTAL_PORTFOLIO.profitRate}%)
            </span>
          </div>
          <div className="mt-3 rounded-xl overflow-hidden h-2" style={{ background: "var(--muted)" }}>
            <div
              className="h-full rounded-xl transition-all duration-500"
              style={{ width: `${Math.max(5, 100 + TOTAL_PORTFOLIO.profitRate)}%`, background: "linear-gradient(90deg, #ef4444, #f97316)" }}
            />
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>수익률 {TOTAL_PORTFOLIO.profitRate}% (전체 손실)</p>
        </div>

        {/* 경고 배너 */}
        <div className="rounded-xl px-4 py-3 flex gap-2 items-start" style={{ background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.3)" }}>
          <AlertTriangle size={16} color="#eab308" className="mt-0.5 flex-shrink-0" />
          <p className="text-xs" style={{ color: "#ca8a04" }}>
            <strong>NICE</strong>·<strong>SK바이오사이언스</strong>는 목표가 하향 이력이 있습니다. 투자 규칙 #15 "목표가 낮추면 무조건 판다"를 확인하세요.
          </p>
        </div>

        {/* 종목 리스트 */}
        <div className="space-y-3">
          <p className="text-sm font-semibold" style={{ color: "var(--muted-foreground)" }}>보유 종목 ({PORTFOLIO_DATA.length})</p>
          {PORTFOLIO_DATA.map((stock) => {
            const isNeg = stock.profitRate < 0;
            const result = results[stock.name];
            const isAnalyzing = analyzing === stock.name;

            return (
              <div key={stock.ticker} className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="px-4 py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base" style={{ color: "var(--foreground)" }}>{stock.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                          {stock.shares.toLocaleString()}주
                        </span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        평균 {stock.avgPrice.toLocaleString()}원 → 현재 {stock.currentPrice.toLocaleString()}원
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-base" style={{ color: isNeg ? "#ef4444" : "#22c55e", fontFamily: "'JetBrains Mono', monospace" }}>
                        {stock.profitRate > 0 ? "+" : ""}{stock.profitRate}%
                      </p>
                      <p className="text-xs" style={{ color: isNeg ? "#ef4444" : "#22c55e" }}>
                        {stock.profit > 0 ? "+" : ""}{stock.profit.toLocaleString()}원
                      </p>
                    </div>
                  </div>

                  {/* 평가금액 바 */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--muted)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(stock.evalAmount / TOTAL_PORTFOLIO.evalAmount) * 100}%`,
                          background: isNeg ? "linear-gradient(90deg, #ef4444, #f97316)" : "linear-gradient(90deg, #22c55e, #16a34a)",
                        }}
                      />
                    </div>
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {((stock.evalAmount / TOTAL_PORTFOLIO.evalAmount) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs mt-1 font-medium" style={{ color: "var(--foreground)" }}>
                    {stock.evalAmount.toLocaleString()}원
                  </p>

                  {/* AI 매도 타이밍 분석 */}
                  <div className="mt-3">
                    {result ? (
                      <div className="rounded-xl p-3" style={{ background: "var(--muted)" }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>AI 매도 분석</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{
                            background: `${verdictColor[result.verdict]}22`,
                            color: verdictColor[result.verdict],
                          }}>
                            {verdictLabel[result.verdict]}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "var(--foreground)" }}>
                          {result.error || result.content.slice(0, 200) + "..."}
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSellAnalysis(stock)}
                        disabled={!!isAnalyzing}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all duration-200"
                        style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)", color: "var(--primary)", border: "1px solid color-mix(in srgb, var(--primary) 25%, transparent)" }}
                      >
                        {isAnalyzing ? <><Loader2 size={14} className="animate-spin" />분석 중...</> : <><ChevronRight size={14} />AI 매도 타이밍 분석</>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
