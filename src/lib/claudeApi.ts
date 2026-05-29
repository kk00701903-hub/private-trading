import { INVESTMENT_RULES } from "./constants";

function getTodayString(): string {
  return new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}


function buildSystemPrompt(today: string): string {
  return `📅 분석 기준일: ${today} (오늘 기준으로 분석하세요)
AI 학습 정보 캯오프 이후 최신 동향은 투자자가 직접 확인하시기 바랍니다.

당신은 한국 주식 투자 전문 AI 어드바이저입니다. 
다음은 사용자가 직접 터득한 22개의 투자 원칙입니다. 이 규칙을 철저히 적용하여 분석해주세요:

${INVESTMENT_RULES.map((r, i) => `${i + 1}. [${r.category}] ${r.rule} - ${r.detail}`).join("\n")}

분석 시 반드시:
1. 위 투자 규칙 중 해당 종목에 적용 가능한 규칙을 명시하고 점검
2. 현재 시장 상황과 종목 상태를 종합하여 판단
3. 매수 / 홀드 / 매도 중 하나를 명확히 권고
4. 근거를 투자 규칙 번호와 함께 제시
5. 주의사항 및 리스크 요인 명시

응답 형식:
## 종합 판단: [매수 🟢 / 홀드 🟡 / 매도 🔴]

## 긍정 요인
- (투자 규칙 번호와 함께)

## 부정 요인 / 주의사항
- (투자 규칙 번호와 함께)

## 적용 투자 규칙 체크리스트
- ✅ 충족: ...
- ❌ 미충족: ...

## 투자 전략 제안
(구체적인 행동 계획)

*이 분석은 투자 참고용이며 최종 결정은 투자자 본인에게 있습니다.`;
}

export interface StockAnalysisRequest {
  stockName: string;
  ticker?: string;
  additionalInfo?: string;
}

export interface AnalysisResult {
  verdict: "buy" | "hold" | "sell";
  content: string;
  error?: string;
}

function getEdgeFunctionUrl(): string {
  const supabaseUrl = localStorage.getItem("supabase_url") || import.meta.env.VITE_SUPABASE_URL || "";
  if (!supabaseUrl) return "";
  return `${supabaseUrl.replace(/\/$/, "")}/functions/v1/claude-analyze`;
}

function getAnonKey(): string {
  return localStorage.getItem("supabase_anon_key") || import.meta.env.VITE_SUPABASE_ANON_KEY || "";
}

async function callClaude(
  system: string,
  userMessage: string,
  maxTokens: number
): Promise<{ text: string; error?: string }> {
  const edgeUrl = getEdgeFunctionUrl();
  const anonKey = getAnonKey();

  if (!edgeUrl) {
    return { text: "", error: "Supabase URL이 설정되지 않았습니다. 설정 탭에서 입력해주세요." };
  }

  const response = await fetch(edgeUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(anonKey ? { apikey: anonKey, Authorization: `Bearer ${anonKey}` } : {}),
    },
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  const data = await response.json() as {
    content?: Array<{ type: string; text: string }>;
    error?: string;
  };

  if (!response.ok) {
    return { text: "", error: `API 오류: ${data?.error || `HTTP ${response.status}`}` };
  }

  return { text: data.content?.[0]?.text || "" };
}

export async function analyzeStock(
  request: StockAnalysisRequest
): Promise<AnalysisResult> {
  const userMessage = `종목명: ${request.stockName}${request.ticker ? ` (티커: ${request.ticker})` : ""}
${request.additionalInfo ? `\n추가 정보: ${request.additionalInfo}` : ""}

위 종목에 대해 투자 규칙을 기반으로 매수/홀드/매도 분석을 해주세요.`;

  try {
    const { text, error } = await callClaude(SYSTEM_PROMPT, userMessage, 1500);
    if (error) return { verdict: "hold", content: "", error };

    let verdict: "buy" | "hold" | "sell" = "hold";
    if (text.includes("매수 🟢") || text.includes("## 종합 판단: 매수")) verdict = "buy";
    else if (text.includes("매도 🔴") || text.includes("## 종합 판단: 매도")) verdict = "sell";

    return { verdict, content: text };
  } catch (e) {
    return { verdict: "hold", content: "", error: `네트워크 오류: ${String(e)}` };
  }
}

export async function analyzeSellTiming(
  portfolioStock: { name: string; profitRate: number; profit: number }
): Promise<AnalysisResult> {
  const today = getTodayString();
  const systemPrompt = buildSystemPrompt(today);
  const userMessage = `[분석 요청일: ${today}]

현재 보유 종목 매도 타이밍 분석을 요청합니다:
- 종목명: ${portfolioStock.name}
- 현재 수익률: ${portfolioStock.profitRate}%
- 평가손익: ${portfolioStock.profit.toLocaleString()}원

이 종목의 현재 보유 상태에서 매도해야 할지, 홀드해야 할지 투자 규칙 기반으로 분석해주세요.
특히 "목표가 하향 시 무조건 판다" 규칙, "손절 기준" 등을 고려해주세요.
학습 캯오프 이후 최신 정보는 "투자자가 확인 필요" 표시 후 분석에 반영해주세요.`;

  try {
    const { text, error } = await callClaude(systemPrompt, userMessage, 1000);
    if (error) return { verdict: "hold", content: "", error };

    let verdict: "buy" | "hold" | "sell" = "hold";
    if (text.includes("매수 🟢")) verdict = "buy";
    else if (text.includes("매도 🔴")) verdict = "sell";

    return { verdict, content: text };
  } catch (e) {
    return { verdict: "hold", content: "", error: `오류: ${String(e)}` };
  }
}
