import { useState, useEffect } from "react";
import { Database, Eye, EyeOff, CheckCircle, AlertCircle, Save, Trash2, ExternalLink } from "lucide-react";

export default function SettingsPage() {
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasConfig, setHasConfig] = useState(false);

  useEffect(() => {
    const url = localStorage.getItem("supabase_url") || import.meta.env.VITE_SUPABASE_URL || "";
    const key = localStorage.getItem("supabase_anon_key") || import.meta.env.VITE_SUPABASE_ANON_KEY || "";
    setSupabaseUrl(url);
    setAnonKey(key);
    setHasConfig(!!(url && key));
  }, []);

  const handleSave = () => {
    if (supabaseUrl.trim() && anonKey.trim()) {
      localStorage.setItem("supabase_url", supabaseUrl.trim());
      localStorage.setItem("supabase_anon_key", anonKey.trim());
      setHasConfig(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const handleDelete = () => {
    localStorage.removeItem("supabase_url");
    localStorage.removeItem("supabase_anon_key");
    setSupabaseUrl("");
    setAnonKey("");
    setHasConfig(false);
  };

  return (
    <div className="flex flex-col min-h-full pb-24">
      {/* Header */}
      <div className="px-4 pt-12 pb-4" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 20%, var(--background)) 0%, var(--background) 100%)" }}>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>설정</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>AI 분석 기능 설정</p>
      </div>

      <div className="px-4 space-y-4 mt-2">
        {/* 연동 상태 */}
        <div className="rounded-2xl p-4 flex items-center gap-3" style={{
          background: hasConfig ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
          border: `1px solid ${hasConfig ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
        }}>
          {hasConfig ? <CheckCircle size={20} color="#22c55e" /> : <AlertCircle size={20} color="#ef4444" />}
          <div>
            <p className="text-sm font-semibold" style={{ color: hasConfig ? "#22c55e" : "#ef4444" }}>
              {hasConfig ? "Supabase 연동 완료" : "Supabase 미설정"}
            </p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {hasConfig ? "AI 분석 탭에서 종목 분석이 가능합니다" : "아래에서 Supabase 프로젝트 정보를 입력해주세요"}
            </p>
          </div>
        </div>

        {/* Supabase 설정 입력 */}
        <div className="rounded-2xl p-4 space-y-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2">
            <Database size={18} style={{ color: "var(--primary)" }} />
            <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>Supabase 프로젝트 설정</p>
          </div>

          {/* Project URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Project URL</label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://xxxxxxxxxxxx.supabase.co"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none font-mono"
              style={{ background: "var(--input)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            />
          </div>

          {/* Anon Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Anon Public Key</label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full pr-10 px-4 py-3 rounded-xl text-sm outline-none font-mono"
                style={{ background: "var(--input)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showKey
                  ? <EyeOff size={16} style={{ color: "var(--muted-foreground)" }} />
                  : <Eye size={16} style={{ color: "var(--muted-foreground)" }} />}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!supabaseUrl.trim() || !anonKey.trim() || saved}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50"
              style={{ background: saved ? "#22c55e" : "var(--primary)", color: "var(--primary-foreground)" }}
            >
              {saved ? <><CheckCircle size={16} />저장 완료!</> : <><Save size={16} />저장하기</>}
            </button>
            {hasConfig && (
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
            <p className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>📌 Supabase 설정 방법</p>
            <ol className="text-xs space-y-1.5" style={{ color: "var(--muted-foreground)" }}>
              <li>1. <strong>supabase.com</strong> → 프로젝트 선택</li>
              <li>2. <strong>Project Settings → API</strong> 탭 이동</li>
              <li>3. <strong>Project URL</strong>과 <strong>anon public</strong> 키 복사</li>
              <li>4. 위 입력란에 붙여넣기 후 저장</li>
            </ol>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium mt-1"
              style={{ color: "var(--primary)" }}
            >
              Supabase 대시보드 열기 <ExternalLink size={11} />
            </a>
          </div>
        </div>

        {/* Claude API 시크릿 안내 */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>🔑 Supabase에 Claude API 키 등록</p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Claude API 키는 Supabase Edge Function 시크릿에 저장되어 브라우저에 노출되지 않습니다.
          </p>
          <ol className="text-xs space-y-2" style={{ color: "var(--muted-foreground)" }}>
            <li className="flex gap-2">
              <span className="font-bold shrink-0" style={{ color: "var(--primary)" }}>1</span>
              <span><strong>Supabase 대시보드</strong> → <strong>Edge Functions</strong> → <strong>Secrets</strong> 탭</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold shrink-0" style={{ color: "var(--primary)" }}>2</span>
              <span>Name: <code className="px-1 py-0.5 rounded text-xs" style={{ background: "var(--muted)" }}>ANTHROPIC_API_KEY</code></span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold shrink-0" style={{ color: "var(--primary)" }}>3</span>
              <span>Value: Anthropic 콘솔에서 발급한 <code className="px-1 py-0.5 rounded text-xs" style={{ background: "var(--muted)" }}>sk-ant-api03-...</code> 키 입력</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold shrink-0" style={{ color: "var(--primary)" }}>4</span>
              <span>또는 CLI: <code className="px-1 py-0.5 rounded text-xs" style={{ background: "var(--muted)" }}>supabase secrets set ANTHROPIC_API_KEY=sk-ant-...</code></span>
            </li>
          </ol>
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-medium"
            style={{ color: "var(--primary)" }}
          >
            Claude API 키 발급 페이지 <ExternalLink size={11} />
          </a>
        </div>

        {/* Edge Function 배포 안내 */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>🚀 Edge Function 배포</p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>로컬에서 Supabase CLI로 배포:</p>
          <div className="rounded-xl p-3 space-y-1.5" style={{ background: "var(--muted)" }}>
            <code className="text-xs block" style={{ color: "var(--foreground)" }}>npm install -g supabase</code>
            <code className="text-xs block" style={{ color: "var(--foreground)" }}>supabase login</code>
            <code className="text-xs block" style={{ color: "var(--foreground)" }}>supabase functions deploy claude-analyze</code>
          </div>
        </div>

        {/* 보안 안내 */}
        <div className="rounded-2xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p className="text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>🔒 보안 구조</p>
          <ul className="space-y-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
            <li>• Claude API 키는 Supabase 서버에만 저장 (브라우저 미노출)</li>
            <li>• Supabase Anon Key는 공개용이므로 노출되어도 안전</li>
            <li>• 앱 → Supabase Edge Function → Claude API 순서로 호출</li>
          </ul>
        </div>

        {/* 앱 정보 */}
        <div className="rounded-2xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>앱 정보</p>
          <div className="space-y-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
            <div className="flex justify-between"><span>버전</span><span>v1.1.0</span></div>
            <div className="flex justify-between"><span>투자 규칙</span><span>22개</span></div>
            <div className="flex justify-between"><span>AI 모델</span><span>Claude claude-opus-4-5</span></div>
            <div className="flex justify-between"><span>데이터 기준</span><span>2026.05.29</span></div>
          </div>
        </div>

        <div className="rounded-xl p-3" style={{ background: "var(--muted)" }}>
          <p className="text-[11px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            ⚠️ 이 앱의 AI 분석은 투자 참고용이며 투자 손익에 대한 책임은 투자자 본인에게 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
