import { useState } from "react";
import { Search, TrendingUp, TrendingDown, Minus, Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { analyzeStock, AnalysisResult } from "@/lib/claudeApi";

const POPULAR_STOCKS = [
  "삼성전자", "SK하이닉스", "LG에너지솔루션", "현대차", "POSCO홀딩스",
  "카카오", "NAVER", "삼성바이오로직스", "셀트리온", "기아",
];

export default function AnalyzePage() {
  const [stockName, setStockName] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [showExtra, setShowExtra] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!stockName.trim()) return;
    setLoading(true);
    setResult(null);
    const apiKey = localStorage.getItem("claude_api_key") || "";
    const res = await analyzeStock({ stockName: stockName.trim(), additionalInfo }, apiKey);
    setResult(res);
    setLoading(false);
  };

  const verdictConfig = {
    buy: { label: "매수 추천 🟢", bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.4)", color: "#22c55e", Icon: TrendingUp },
    sell: { label: "매도 추천 🔴", bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.4)", color: "#ef4444", Icon: TrendingDown },
    hold: { label: "홀드 🟡", bg: "rgba(234,179,8,0.15)", border: "rgba(234,179,8,0.4)", color: "#eab308", Icon: Minus },
  };

  return (
    <div className="flex flex-col min-h-full pb-24">
      {/* Header */}
      <div className="px-4 pt-12 pb-4" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 20%, var(--background)) 0%, var(--background) 100%)" }}>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>AI 종목 분석</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>22개 투자 원칙 기반 매수·홀드·매도 판단</p>
      </div>

      <div className="px-4 space-y-4">
        {/* Search Input */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
              <input
                type="text"
                value={stockName}
                onChange={(e) => setStockName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                placeholder="종목명 입력 (예: 삼성전자)"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--input)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={loading || !stockName.trim()}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "분석"}
            </button>
          </div>

          {/* Additional Info Toggle */}
          <button
            onClick={() => setShowExtra(!showExtra)}
            className="flex items-center gap-1 text-xs"
            style={{ color: "var(--muted-foreground)" }}
          >
            {showExtra ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            추가 정보 입력 (선택)
          </button>
          {showExtra && (
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="목표가, 최근 뉴스, 현재 가격 등 추가 정보를 입력하면 더 정확한 분석이 가능합니다"
              rows={3}
              className="w-full p-3 rounded-xl text-sm outline-none resize-none"
              style={{ background: "var(--input)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            />
          )}
        </div>

        {/* Popular Stocks */}
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>인기 종목</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_STOCKS.map((stock) => (
              <button
                key={stock}
                onClick={() => setStockName(stock)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150"
                style={{
                  background: stockName === stock ? "var(--primary)" : "var(--muted)",
                  color: stockName === stock ? "var(--primary-foreground)" : "var(--muted-foreground)",
                }}
              >
                {stock}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl p-8 flex flex-col items-center gap-3" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>AI가 22개 투자 원칙을 적용하여 분석 중...</p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>약 10~20초 소요됩니다</p>
          </div>
        )}

        {/* Error */}
        {result?.error && (
          <div className="rounded-2xl p-4 flex gap-3" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <AlertCircle size={18} color="#ef4444" className="flex-shrink-0 mt-0.5" />
            <p className="text-sm" style={{ color: "#ef4444" }}>{result.error}</p>
          </div>
        )}

        {/* Result */}
        {result && !result.error && result.content && (
          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${verdictConfig[result.verdict].border}` }}>
            {/* Verdict Banner */}
            <div className="px-4 py-3 flex items-center gap-3" style={{ background: verdictConfig[result.verdict].bg }}>
              {(() => { const { Icon } = verdictConfig[result.verdict]; return <Icon size={22} color={verdictConfig[result.verdict].color} />; })()}
              <div>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{stockName} 분석 결과</p>
                <p className="font-bold text-base" style={{ color: verdictConfig[result.verdict].color }}>
                  {verdictConfig[result.verdict].label}
                </p>
              </div>
            </div>
            {/* Content */}
            <div className="px-4 py-4" style={{ background: "var(--card)" }}>
              <div
                className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: "var(--foreground)" }}
              >
                {result.content}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !result && (
          <div className="rounded-2xl p-8 flex flex-col items-center gap-3 text-center" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)" }}>
              📊
            </div>
            <p className="font-semibold" style={{ color: "var(--foreground)" }}>종목을 입력하고 분석을 시작하세요</p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              사용자가 직접 터득한 22개의 투자 원칙을 기반으로<br />Claude AI가 매수/홀드/매도를 판단합니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
