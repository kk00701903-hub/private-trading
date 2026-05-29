import { useState, useEffect } from "react";
import { Key, Eye, EyeOff, CheckCircle, AlertCircle, Save, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("claude_api_key") || "";
    setApiKey(stored);
    setHasKey(!!stored);
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem("claude_api_key", apiKey.trim());
      setHasKey(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const handleDelete = () => {
    localStorage.removeItem("claude_api_key");
    setApiKey("");
    setHasKey(false);
  };

  return (
    <div className="flex flex-col min-h-full pb-24">
      {/* Header */}
      <div className="px-4 pt-12 pb-4" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 20%, var(--background)) 0%, var(--background) 100%)" }}>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>설정</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>AI 분석 기능 설정</p>
      </div>

      <div className="px-4 space-y-4 mt-2">
        {/* API 키 상태 */}
        <div className="rounded-2xl p-4 flex items-center gap-3" style={{
          background: hasKey ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
          border: `1px solid ${hasKey ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
        }}>
          {hasKey ? <CheckCircle size={20} color="#22c55e" /> : <AlertCircle size={20} color="#ef4444" />}
          <div>
            <p className="text-sm font-semibold" style={{ color: hasKey ? "#22c55e" : "#ef4444" }}>
              {hasKey ? "API 키 연동 완료" : "API 키 미설정"}
            </p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {hasKey ? "AI 분석 탭에서 종목 분석이 가능합니다" : "아래에서 Claude API 키를 입력해주세요"}
            </p>
          </div>
        </div>

        {/* API 키 입력 */}
        <div className="rounded-2xl p-4 space-y-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2">
            <Key size={18} style={{ color: "var(--primary)" }} />
            <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>Claude API 키</p>
          </div>

          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="w-full pr-10 px-4 py-3 rounded-xl text-sm outline-none font-mono"
              style={{ background: "var(--input)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showKey ? <EyeOff size={16} style={{ color: "var(--muted-foreground)" }} /> : <Eye size={16} style={{ color: "var(--muted-foreground)" }} />}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!apiKey.trim() || saved}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50"
              style={{ background: saved ? "#22c55e" : "var(--primary)", color: "var(--primary-foreground)" }}
            >
              {saved ? <><CheckCircle size={16} />저장 완료!</> : <><Save size={16} />저장하기</>}
            </button>
            {hasKey && (
              <button
                onClick={handleDelete}
                className="px-4 py-3 rounded-xl transition-all duration-200"
                style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          {/* 안내 */}
          <div className="rounded-xl p-3 space-y-2" style={{ background: "var(--muted)" }}>
            <p className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>📌 Claude API 키 발급 방법</p>
            <ol className="text-xs space-y-1" style={{ color: "var(--muted-foreground)" }}>
              <li>1. <strong>console.anthropic.com</strong> 접속</li>
              <li>2. 회원가입 후 로그인</li>
              <li>3. API Keys 메뉴 → Create Key</li>
              <li>4. 생성된 키 복사 후 위에 입력</li>
            </ol>
          </div>
        </div>

        {/* 보안 안내 */}
        <div className="rounded-2xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p className="text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>🔒 보안 안내</p>
          <ul className="space-y-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
            <li>• API 키는 이 기기의 로컬 저장소(localStorage)에만 보관됩니다</li>
            <li>• 서버로 전송되거나 외부에 공유되지 않습니다</li>
            <li>• 공용 기기에서는 사용 후 삭제를 권장합니다</li>
            <li>• Anthropic 콘솔에서 API 사용량과 비용을 직접 확인하세요</li>
          </ul>
        </div>

        {/* 앱 정보 */}
        <div className="rounded-2xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>앱 정보</p>
          <div className="space-y-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
            <div className="flex justify-between"><span>버전</span><span>v1.0.0</span></div>
            <div className="flex justify-between"><span>투자 규칙</span><span>22개</span></div>
            <div className="flex justify-between"><span>AI 모델</span><span>Claude claude-opus-4-5</span></div>
            <div className="flex justify-between"><span>데이터 기준</span><span>2026.05.29</span></div>
          </div>
        </div>

        {/* 면책 고지 */}
        <div className="rounded-xl p-3" style={{ background: "var(--muted)" }}>
          <p className="text-[11px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            ⚠️ 이 앱의 AI 분석은 투자 참고용이며 투자 손익에 대한 책임은 투자자 본인에게 있습니다. 
            과거 수익률이 미래 수익을 보장하지 않습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
