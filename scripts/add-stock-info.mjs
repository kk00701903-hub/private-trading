import { readFileSync, writeFileSync } from "fs";

// Patch claudeApi.ts — add fetchStockInfo() and wire it into analyzeStock()
let src = readFileSync("src/lib/claudeApi.ts", "utf8");

// 1) Add fetchStockInfo helper after getAnonKey()
const STOCK_INFO_FN = `
async function fetchStockInfo(
  stockName: string,
  ticker?: string
): Promise<string> {
  const supabaseUrl = localStorage.getItem("supabase_url") || import.meta.env.VITE_SUPABASE_URL || "";
  const anonKey = localStorage.getItem("supabase_anon_key") || import.meta.env.VITE_SUPABASE_ANON_KEY || "";
  if (!supabaseUrl) return "";
  const url = \`\${supabaseUrl.replace(/\\/\$/, "")}/functions/v1/stock-info\`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(anonKey ? { apikey: anonKey, Authorization: \`Bearer \${anonKey}\` } : {}),
      },
      body: JSON.stringify({ stockName, ticker }),
    });
    if (!res.ok) return "";
    const data: { context?: string; hasRealData?: boolean } = await res.json();
    return data.context ?? "";
  } catch {
    return "";
  }
}
`;

src = src.replace(
  "async function callClaude(",
  `${STOCK_INFO_FN}\nasync function callClaude(`
);

// 2) In analyzeStock: fetch real-time context before building userMessage
const OLD_ANALYZE = `  const today = getTodayString();
  const systemPrompt = buildSystemPrompt(today);
  const userMessage = \`[\uBD84\uC11D \uC694\uCCAD\uC77C: \${today}]

\uC885\uBAA9\uBA85: \${request.stockName}\${request.ticker ? \` (\uD2F0\uCF64: \${request.ticker})\` : ""}
\${request.additionalInfo ? \`\uCD94\uAC00 \uC815\uBCF4 / \uC2DC\uC7A5 \uD604\uD669: \${request.additionalInfo}\` : ""}

\uC704 \uC885\uBAA9\uC5D0 \uB300\uD574 \uD22C\uC790 \uADDC\uCE59\uC744 \uAE30\uBC18\uC73C\uB85C \uB9E4\uC218/\uD640\uB4DC/\uB9E4\uB3C4 \uBD84\uC11D\uC744 \uD574\uC8FC\uC138\uC694.
\uD559\uC2B5 \uCEAF\uC624\uD504 \uC774\uD6C4 \uCD5C\uC2E0 \uC815\uBCF4\uB294 "\uD22C\uC790\uC790\uAC00 \uD655\uC778 \uD544\uC694" \uD45C\uC2DC \uD6C4 \uBD84\uC11D\uC5D0 \uBC18\uC601\uD574\uC8FC\uC138\uC694.\`;`;

const NEW_ANALYZE = `  const today = getTodayString();
  const systemPrompt = buildSystemPrompt(today);

  // Fetch real-time stock data from Naver Finance
  const realtimeContext = await fetchStockInfo(request.stockName, request.ticker);

  const userMessage = \`[\uBD84\uC11D \uC694\uCCAD\uC77C: \${today}]

\uC885\uBAA9\uBA85: \${request.stockName}\${request.ticker ? \` (\uD2F0\uCF64: \${request.ticker})\` : ""}

\${realtimeContext ? \`[\uC2E4\uC2DC\uAC04 \uC2DC\uC7A5 \uB370\uC774\uD130 - \uB124\uC774\uBC84 \uAE08\uC735]\n\${realtimeContext}\n\` : "[\uC2E4\uC2DC\uAC04 \uB370\uC774\uD130 \uBD88\uAC00 - \uD559\uC2B5 \uB370\uC774\uD130 \uAE30\uBC18 \uBD84\uC11D]\n"}\${request.additionalInfo ? \`\n[\uC0AC\uC6A9\uC790 \uCD94\uAC00 \uC815\uBCF4]\n\${request.additionalInfo}\n\` : ""}
\uC704 \uC885\uBAA9\uC5D0 \uB300\uD574 \uD22C\uC790 \uADDC\uCE59 42\uAC1C \uC804\uCCB4\uB97C \uAE30\uBC18\uC73C\uB85C \uB9E4\uC218/\uD640\uB4DC/\uB9E4\uB3C4 \uBD84\uC11D\uC744 \uD574\uC8FC\uC138\uC694.
\uC2E4\uC2DC\uAC04 \uB370\uC774\uD130\uAC00 \uC788\uB2E4\uBA74 \uBC18\uB4DC\uC2DC \uC774\uB97C \uC911\uC2EC\uC73C\uB85C \uBD84\uC11D\uD558\uACE0, \uBD80\uC871\uD55C \uBD80\uBD84\uC740 \uD559\uC2B5 \uB370\uC774\uD130\uB85C \uBCF4\uC644\uD558\uC138\uC694.\`;`;

src = src.replace(OLD_ANALYZE, NEW_ANALYZE);

writeFileSync("src/lib/claudeApi.ts", src, "utf8");
console.log("claudeApi.ts patched with fetchStockInfo.");

// Verify
const result = readFileSync("src/lib/claudeApi.ts", "utf8");
console.log("fetchStockInfo fn:", result.includes("fetchStockInfo") ? "OK" : "MISSING");
console.log("realtimeContext:", result.includes("realtimeContext") ? "OK" : "MISSING");


// Patch AnalyzePage.tsx — add loading steps
let page = readFileSync("src/pages/AnalyzePage.tsx", "utf8");

// 1) Add loadingStep state
page = page.replace(
  `  const [loading, setLoading] = useState(false);`,
  `  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<"data" | "ai" | null>(null);`
);

// 2) Update handleAnalyze to set loading steps
page = page.replace(
  `    setLoading(true);
    setResult(null);
    const res = await analyzeStock({ stockName: stockName.trim(), additionalInfo });
    setResult(res);
    setLoading(false);`,
  `    setLoading(true);
    setLoadingStep("data");
    setResult(null);
    // Brief pause so the "data collection" step is visible before AI call starts
    await new Promise((r) => setTimeout(r, 400));
    setLoadingStep("ai");
    const res = await analyzeStock({ stockName: stockName.trim(), additionalInfo });
    setResult(res);
    setLoading(false);
    setLoadingStep(null);`
);

// 3) Update loading card to show two-step progress
page = page.replace(
  `        {loading && (
          <div className="rounded-2xl p-8 flex flex-col items-center gap-3" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>AI\uAC00 22\uAC1C \uD22C\uC790 \uC6D0\uCE59\uC744 \uC801\uC6A9\uD558\uC5EC \uBD84\uC11D \uC911...</p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>\uC57D 10~20\uCD08 \uC18C\uC694\uB429\uB2C8\uB2E4</p>
          </div>
        )}`,
  `        {loading && (
          <div className="rounded-2xl p-6 flex flex-col items-center gap-3" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
            <div className="w-full space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                  style={{ background: loadingStep === "data" || loadingStep === "ai" ? "var(--primary)" : "var(--muted)" }}>
                  {loadingStep === "ai" ? "\u2713" : "1"}
                </div>
                <p className="text-sm font-medium" style={{ color: loadingStep === "data" ? "var(--foreground)" : "var(--muted-foreground)" }}>
                  \uD3B4\uC774\uBC84 \uAE08\uC735 \uC2E4\uC2DC\uAC04 \uB370\uC774\uD130 \uC218\uC9D1 \uC911...
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                  style={{ background: loadingStep === "ai" ? "var(--primary)" : "var(--muted)",
                           color: loadingStep === "ai" ? "var(--primary-foreground)" : "var(--muted-foreground)" }}>
                  2
                </div>
                <p className="text-sm font-medium" style={{ color: loadingStep === "ai" ? "var(--foreground)" : "var(--muted-foreground)" }}>
                  AI\uAC00 42\uAC1C \uD22C\uC790 \uC6D0\uCE59 \uC801\uC6A9\uD558\uC5EC \uBD84\uC11D \uC911...
                </p>
              </div>
            </div>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>\uC57D 15~25\uCD08 \uC18C\uC694\uB429\uB2C8\uB2E4</p>
          </div>
        )}`
);

// 4) Update empty state subtitle to mention 42 rules and real-time data
page = page.replace(
  `\uC0AC\uC6A9\uC790\uAC00 \uC9C1\uC811 \uD130\uB4DD\uD55C 22\uAC1C\uC758 \uD22C\uC790 \uC6D0\uCE59\uC744 \uAE30\uBC18\uC73C\uB85C<br />Claude AI\uAC00 \uB9E4\uC218/\uD640\uB4DC/\uB9E4\uB3C4\uB97C \uD310\uB2E8\uD569\uB2C8\uB2E4`,
  `\uB124\uC774\uBC84 \uAE08\uC735 \uC2E4\uC2DC\uAC04 \uC8FC\uAC00 + \uCD5C\uC2E0 \uB274\uC2A4\uB97C \uC218\uC9D1\uD558\uC5EC<br />42\uAC1C \uD22C\uC790 \uC6D0\uCE59 \uAE30\uBC18\uC73C\uB85C Claude AI\uAC00 \uBD84\uC11D\uD569\uB2C8\uB2E4`
);

// 5) Update header subtitle
page = page.replace(
  `22\uAC1C \uD22C\uC790 \uC6D0\uCE59 \uAE30\uBC18 \uB9E4\uC218\u00B7\uD640\uB4DC\u00B7\uB9E4\uB3C4 \uD310\uB2E8`,
  `\uC2E4\uC2DC\uAC04 \uC8FC\uAC00 + \uCD5C\uC2E0 \uB274\uC2A4 \uC218\uC9D1 \u2192 42\uAC1C \uD22C\uC790 \uC6D0\uCE59 AI \uBD84\uC11D`
);

writeFileSync("src/pages/AnalyzePage.tsx", page, "utf8");
console.log("AnalyzePage.tsx patched with multi-step loading.");

// Verify
const pageResult = readFileSync("src/pages/AnalyzePage.tsx", "utf8");
console.log("loadingStep state:", pageResult.includes("loadingStep") ? "OK" : "MISSING");
console.log("two-step loading:", pageResult.includes("\uD3B4\uC774\uBC84 \uAE08\uC735 \uC2E4\uC2DC\uAC04") ? "OK" : "MISSING");
