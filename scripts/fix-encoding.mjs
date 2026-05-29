import { writeFileSync } from "fs";

const claudeApiContent = `import { INVESTMENT_RULES } from "./constants";

function buildSystemPrompt(today: string): string {
  return \`\uB2F9\uC2E0\uC740 \uD55C\uAD6D \uC8FC\uC2DD \uD22C\uC790 \uC804\uBB38 AI \uC5B4\uB4DC\uBC14\uC774\uC800\uC785\uB2C8\uB2E4.

\u{1F4C5} \uC624\uB298 \uB0A0\uC9DC: \${today}
\uC704 \uB0A0\uC9DC\uB97C \uAE30\uC900\uC73C\uB85C \uBD84\uC11D\uD558\uC138\uC694. \uD559\uC2B5 \uB370\uC774\uD130 \uCEAT\uC624\uD504\uAC00 \uC788\uC5B4 \uCD5C\uADFC \uC0C8\uBCBD\uAE4C\uC9C0\uC758 \uC815\uBCF4\uAC00 \uC5C6\uC744 \uC218 \uC788\uC73C\uBBF8\uB85C, \uBD84\uC11D \uC2DC \uB2E4\uC74C\uC744 \uBC18\uB4DC\uC2DC \uba85\uC2DC\uD558\uC138\uC694:
- \uBD84\uC11D \uADFC\uAC70\uAC00 \uB41C \uAC00\uC7A5 \uCD5C\uC2E0 \uC815\uBCF4\uC758 \uC2DC\uC810\uC744 \uBA85\uD655\uD788 \uD45C\uAE30
- \"\uC624\uB298\uB0A0\uC9DC \uAE30\uC900\uC73C\uB85C\uB294 \uCD94\uAC00 \uD655\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4\" \uC548\uB0B4 \uD3EC\uD568
- \uD604\uC7AC \uC8FC\uAC00\uB97C \uC9C1\uC811 \uC81C\uC2DC\uD558\uC9C0 \uC54A\uACE0 \uD22C\uC790\uC790\uAC00 \uD655\uC778\uD558\uB3C4\uB85D \uC548\uB0B4

\uB2E4\uC74C\uC740 \uC0AC\uC6A9\uC790\uAC00 \uC9C1\uC811 \uD130\uB4DD\uD55C 22\uAC1C\uC758 \uD22C\uC790 \uC6D0\uCE59\uC785\uB2C8\uB2E4. \uC774 \uADDC\uCE59\uC744 \uCCA0\uC800\uD788 \uC801\uC6A9\uD558\uC5EC \uBD84\uC11D\uD574\uC8FC\uC138\uC694:

\${INVESTMENT_RULES.map((r, i) => \`\${i + 1}. [\${r.category}] \${r.rule} - \${r.detail}\`).join("\\n")}

\uBD84\uC11D \uC2DC \uBC18\uB4DC\uC2DC:
1. \uC704 \uD22C\uC790 \uADDC\uCE59 \uC911 \uD574\uB2F9 \uC885\uBAA9\uC5D0 \uC801\uC6A9 \uAC00\uB2A5\uD55C \uADDC\uCE59\uC744 \uBA85\uC2DC\uD558\uACE0 \uC810\uAC80
2. \uD604\uC7AC \uC2DC\uC7A5 \uC0C1\uD669\uACFC \uC885\uBAA9 \uC0C1\uD0DC\uB97C \uC885\uD569\uD558\uC5EC \uD310\uB2E8
3. \uB9E4\uC218 / \uD640\uB4DC / \uB9E4\uB3C4 \uC911 \uD558\uB098\uB97C \uBA85\uD655\uD788 \uAD8C\uACE0
4. \uADFC\uAC70\uB97C \uD22C\uC790 \uADDC\uCE59 \uBC88\uD638\uC640 \uD568\uAED8 \uC81C\uC2DC
5. \uC8FC\uC758\uC0AC\uD56D \uBC0F \uB9AC\uC2A4\uD06C \uC694\uC778 \uBA85\uC2DC

\uC751\uB2F5 \uD615\uC2DD:
## \uC885\uD569 \uD310\uB2E8: [\uB9E4\uC218 \uD83D\uDFE2 / \uD640\uB4DC \uD83D\uDFE1 / \uB9E4\uB3C4 \uD83D\uDD34]

## \uAE0D\uC815 \uC694\uC778
- (\uD22C\uC790 \uADDC\uCE59 \uBC88\uD638\uC640 \uD568\uAED8)

## \uBD80\uC815 \uC694\uC778 / \uC8FC\uC758\uC0AC\uD56D
- (\uD22C\uC790 \uADDC\uCE59 \uBC88\uD638\uC640 \uD568\uAED8)

## \uC801\uC6A9 \uD22C\uC790 \uADDC\uCE59 \uCCB4\uD06C\uB9AC\uC2A4\uD2B8
- \u2705 \uCDA9\uC871: ...
- \u274C \uBBF8\uCDA9\uC871: ...

## \uD22C\uC790 \uC804\uB7B5 \uC81C\uC548
(\uAD6C\uCCB4\uC801\uC778 \uD589\uB3D9 \uACC4\uD68D)

*\uC774 \uBD84\uC11D\uC740 \uD22C\uC790 \uCC38\uACE0\uC6A9\uC774\uBA70 \uCD5C\uC885 \uACB0\uC815\uC740 \uD22C\uC790\uC790 \uBCF8\uC778\uC5D0\uAC8C \uC788\uC2B5\uB2C8\uB2E4.\`;
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
  return \`\${supabaseUrl.replace(/\\/\\$/, "")}/functions/v1/claude-analyze\`;
}

function getAnonKey(): string {
  return localStorage.getItem("supabase_anon_key") || import.meta.env.VITE_SUPABASE_ANON_KEY || "";
}

function getTodayString(): string {
  return new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

async function callClaude(
  system: string,
  userMessage: string,
  maxTokens: number
): Promise<{ text: string; error?: string }> {
  const edgeUrl = getEdgeFunctionUrl();
  const anonKey = getAnonKey();

  if (!edgeUrl) {
    return { text: "", error: "Supabase URL\uC774 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uC124\uC815 \uD0ED\uC5D0\uC11C \uC785\uB825\uD574\uC8FC\uC138\uC694." };
  }

  const response = await fetch(edgeUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(anonKey ? { apikey: anonKey, Authorization: \`Bearer \${anonKey}\` } : {}),
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
    return { text: "", error: \`API \uC624\uB958: \${data?.error || \`HTTP \${response.status}\`}\` };
  }

  return { text: data.content?.[0]?.text || "" };
}

export async function analyzeStock(
  request: StockAnalysisRequest
): Promise<AnalysisResult> {
  const today = getTodayString();
  const systemPrompt = buildSystemPrompt(today);

  const userMessage = \`[\uBD84\uC11D \uC694\uCCAD\uC77C: \${today}]

\uC885\uBAA9\uBA85: \${request.stockName}\${request.ticker ? \` (\uD2F0\uCF74: \${request.ticker})\` : ""}
\${request.additionalInfo ? \`\uCD94\uAC00 \uC815\uBCF4 / \uC2DC\uC7A5 \uD604\uD669: \${request.additionalInfo}\` : ""}

\uC704 \uC885\uBAA9\uC5D0 \uB300\uD574 \uD22C\uC790 \uADDC\uCE59\uC744 \uAE30\uBC18\uC73C\uB85C \uB9E4\uC218/\uD640\uB4DC/\uB9E4\uB3C4 \uBD84\uC11D\uC744 \uD574\uC8FC\uC138\uC694.
\uD559\uC2B5 \uB370\uC774\uD130\uC5D0 \uC5C6\uB294 \uCD5C\uADFC \uC815\uBCF4\uB294 \"\uD22C\uC790\uC790\uAC00 \uD655\uC778 \uD544\uC694\" \uD45C\uC2DC \uD6C4 \uBD84\uC11D\uC5D0 \uBC18\uC601\uD574\uC8FC\uC138\uC694.\`;

  try {
    const { text, error } = await callClaude(systemPrompt, userMessage, 1500);
    if (error) return { verdict: "hold", content: "", error };

    let verdict: "buy" | "hold" | "sell" = "hold";
    if (text.includes("\uB9E4\uC218 \uD83D\uDFE2") || text.includes("## \uC885\uD569 \uD310\uB2E8: \uB9E4\uC218")) verdict = "buy";
    else if (text.includes("\uB9E4\uB3C4 \uD83D\uDD34") || text.includes("## \uC885\uD569 \uD310\uB2E8: \uB9E4\uB3C4")) verdict = "sell";

    return { verdict, content: text };
  } catch (e) {
    return { verdict: "hold", content: "", error: \`\uB124\uD2B8\uC6CC\uD06C \uC624\uB958: \${String(e)}\` };
  }
}

export async function analyzeSellTiming(
  portfolioStock: { name: string; profitRate: number; profit: number }
): Promise<AnalysisResult> {
  const today = getTodayString();
  const systemPrompt = buildSystemPrompt(today);

  const userMessage = \`[\uBD84\uC11D \uC694\uCCAD\uC77C: \${today}]

\uD604\uC7AC \uBCF4\uC720 \uC885\uBAA9 \uB9E4\uB3C4 \uD0C0\uC774\uBC0D \uBD84\uC11D\uC744 \uC694\uCCAD\uD569\uB2C8\uB2E4:
- \uC885\uBAA9\uBA85: \${portfolioStock.name}
- \uD604\uC7AC \uC218\uC775\uB960: \${portfolioStock.profitRate}%
- \uD3C9\uAC00\uC190\uC775: \${portfolioStock.profit.toLocaleString()}\uC6D0

\uC774 \uC885\uBAA9\uC758 \uD604\uC7AC \uBCF4\uC720 \uC0C1\uD0DC\uC5D0\uC11C \uB9E4\uB3C4\uD574\uC57C \uD560\uC9C0, \uD640\uB4DC\uD574\uC57C \uD560\uC9C0 \uD22C\uC790 \uADDC\uCE59 \uAE30\uBC18\uC73C\uB85C \uBD84\uC11D\uD574\uC8FC\uC138\uC694.
\uD2B9\uD788 \"\uBAA9\uD45C\uAC00 \uD558\uD5A5 \uC2DC \uBB34\uC870\uAC74 \uD310\uB2E4\" \uADDC\uCE59, \"\uC190\uC808 \uAE30\uC900\" \uB4F1\uC744 \uACE0\uB824\uD574\uC8FC\uC138\uC694.
\uD559\uC2B5 \uB370\uC774\uD130 \uCEAT\uC624\uD504 \uC774\uD6C4 \uCD5C\uC2E0 \uC815\uBCF4\uB294 \"\uD22C\uC790\uC790\uAC00 \uD655\uC778 \uD544\uC694\" \uD45C\uC2DC \uD6C4 \uBD84\uC11D\uC5D0 \uBC18\uC601\uD574\uC8FC\uC138\uC694.\`;

  try {
    const { text, error } = await callClaude(systemPrompt, userMessage, 1000);
    if (error) return { verdict: "hold", content: "", error };

    let verdict: "buy" | "hold" | "sell" = "hold";
    if (text.includes("\uB9E4\uC218 \uD83D\uDFE2")) verdict = "buy";
    else if (text.includes("\uB9E4\uB3C4 \uD83D\uDD34")) verdict = "sell";

    return { verdict, content: text };
  } catch (e) {
    return { verdict: "hold", content: "", error: \`\uC624\uB958: \${String(e)}\` };
  }
}
`;

import { writeFileSync } from "fs";
writeFileSync("src/lib/claudeApi.ts", claudeApiContent, "utf8");
console.log("claudeApi.ts written with date injection.");
