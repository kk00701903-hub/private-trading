import { readFileSync, writeFileSync } from "fs";

let src = readFileSync("src/lib/claudeApi.ts", "utf8");

// 1) Add getTodayString() helper right after the import line
const GET_TODAY_FN = `
function getTodayString(): string {
  return new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}
`;
src = src.replace(
  `import { INVESTMENT_RULES } from "./constants";`,
  `import { INVESTMENT_RULES } from "./constants";\n${GET_TODAY_FN}`
);

// 2) Convert static SYSTEM_PROMPT const -> buildSystemPrompt(today) function
//    Before: const SYSTEM_PROMPT = `...`;
//    After:  function buildSystemPrompt(today: string): string { return `... ${today} ...`; }
src = src.replace(
  "const SYSTEM_PROMPT = `",
  "function buildSystemPrompt(today: string): string {\n  return `"
);

// Close the const backtick -> close the function
// The original ends with:  *이 분석은 투자 참고용이며 최종 결정은 투자자 본인에게 있습니다.`;
src = src.replace(
  "*\uC774 \uBD84\uC11D\uC740 \uD22C\uC790 \uCC38\uACE0\uC6A9\uC774\uBA70 \uCD5C\uC885 \uACB0\uC815\uC740 \uD22C\uC790\uC790 \uBCF8\uC778\uC5D0\uAC8C \uC788\uC2B5\uB2C8\uB2E4.\`;",
  "*\uC774 \uBD84\uC11D\uC740 \uD22C\uC790 \uCC38\uACE0\uC6A9\uC774\uBA70 \uCD5C\uC885 \uACB0\uC815\uC740 \uD22C\uC790\uC790 \uBCF8\uC778\uC5D0\uAC8C \uC788\uC2B5\uB2C8\uB2E4.\`;\n}"
);

// 3) Inject date header at the start of the system prompt content
//    Right after the opening backtick of buildSystemPrompt
src = src.replace(
  "function buildSystemPrompt(today: string): string {\n  return `\uB2F9\uC2E0\uC740",
  "function buildSystemPrompt(today: string): string {\n  return `\uD83D\uDCC5 \uBD84\uC11D \uAE30\uC900\uC77C: ${today} (\uC624\uB298 \uAE30\uC900\uC73C\uB85C \uBD84\uC11D\uD558\uC138\uC694)\nAI \uD559\uC2B5 \uC815\uBCF4 \uCEAF\uC624\uD504 \uC774\uD6C4 \uCD5C\uC2E0 \uB3D9\uD5A5\uC740 \uD22C\uC790\uC790\uAC00 \uC9C1\uC811 \uD655\uC778\uD558\uC2DC\uAE30 \uBC14\uB78D\uB2C8\uB2E4.\n\n\uB2F9\uC2E0\uC740"
);

// 4) analyzeStock: get today + build prompt + inject date into userMessage
src = src.replace(
  `export async function analyzeStock(
  request: StockAnalysisRequest
): Promise<AnalysisResult> {
  const userMessage = \`\uC885\uBAA9\uBA85: \${request.stockName}\${request.ticker ? \` (\uD2F0\uCF64: \${request.ticker})\` : ""}
\${request.additionalInfo ? \`\\n\uCD94\uAC00 \uC815\uBCF4: \${request.additionalInfo}\` : ""}

\uC704 \uC885\uBAA9\uC5D0 \uB300\uD574 \uD22C\uC790 \uADDC\uCE59\uC744 \uAE30\uBC18\uC73C\uB85C \uB9E4\uC218/\uD640\uB4DC/\uB9E4\uB3C4 \uBD84\uC11D\uC744 \uD574\uC8FC\uC138\uC694.\`;

  try {
    const { text, error } = await callClaude(SYSTEM_PROMPT, userMessage, 1500);`,
  `export async function analyzeStock(
  request: StockAnalysisRequest
): Promise<AnalysisResult> {
  const today = getTodayString();
  const systemPrompt = buildSystemPrompt(today);
  const userMessage = \`[\uBD84\uC11D \uC694\uCCAD\uC77C: \${today}]

\uC885\uBAA9\uBA85: \${request.stockName}\${request.ticker ? \` (\uD2F0\uCF64: \${request.ticker})\` : ""}
\${request.additionalInfo ? \`\uCD94\uAC00 \uC815\uBCF4 / \uC2DC\uC7A5 \uD604\uD669: \${request.additionalInfo}\` : ""}

\uC704 \uC885\uBAA9\uC5D0 \uB300\uD574 \uD22C\uC790 \uADDC\uCE59\uC744 \uAE30\uBC18\uC73C\uB85C \uB9E4\uC218/\uD640\uB4DC/\uB9E4\uB3C4 \uBD84\uC11D\uC744 \uD574\uC8FC\uC138\uC694.
\uD559\uC2B5 \uCEAF\uC624\uD504 \uC774\uD6C4 \uCD5C\uC2E0 \uC815\uBCF4\uB294 \"\uD22C\uC790\uC790\uAC00 \uD655\uC778 \uD544\uC694\" \uD45C\uC2DC \uD6C4 \uBD84\uC11D\uC5D0 \uBC18\uC601\uD574\uC8FC\uC138\uC694.\`;

  try {
    const { text, error } = await callClaude(systemPrompt, userMessage, 1500);`
);

// 5) analyzeSellTiming: same treatment
src = src.replace(
  `export async function analyzeSellTiming(
  portfolioStock: { name: string; profitRate: number; profit: number }
): Promise<AnalysisResult> {
  const userMessage = \`\uD604\uC7AC \uBCF4\uC720 \uC885\uBAA9 \uB9E4\uB3C4 \uD0C0\uC774\uBC0D \uBD84\uC11D\uC744 \uC694\uCCAD\uD569\uB2C8\uB2E4:
- \uC885\uBAA9\uBA85: \${portfolioStock.name}
- \uD604\uC7AC \uC218\uC775\uB960: \${portfolioStock.profitRate}%
- \uD3C9\uAC00\uC190\uC775: \${portfolioStock.profit.toLocaleString()}\uC6D0

\uC774 \uC885\uBAA9\uC758 \uD604\uC7AC \uBCF4\uC720 \uC0C1\uD0DC\uC5D0\uC11C \uB9E4\uB3C4\uD574\uC57C \uD560\uC9C0, \uD640\uB4DC\uD574\uC57C \uD560\uC9C0 \uD22C\uC790 \uADDC\uCE59 \uAE30\uBC18\uC73C\uB85C \uBD84\uC11D\uD574\uC8FC\uC138\uC694.
\uD2B9\uD788 "\uBAA9\uD45C\uAC00 \uD558\uD5A5 \uC2DC \uBB34\uC870\uAC74 \uD310\uB2E4" \uADDC\uCE59, "\uC190\uC808 \uAE30\uC900" \uB4F1\uC744 \uACE0\uB824\uD574\uC8FC\uC138\uC694.\`;

  try {
    const { text, error } = await callClaude(SYSTEM_PROMPT, userMessage, 1000);`,
  `export async function analyzeSellTiming(
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
\uD2B9\uD788 "\uBAA9\uD45C\uAC00 \uD558\uD5A5 \uC2DC \uBB34\uC870\uAC74 \uD310\uB2E4" \uADDC\uCE59, "\uC190\uC808 \uAE30\uC900" \uB4F1\uC744 \uACE0\uB824\uD574\uC8FC\uC138\uC694.
\uD559\uC2B5 \uCEAF\uC624\uD504 \uC774\uD6C4 \uCD5C\uC2E0 \uC815\uBCF4\uB294 "\uD22C\uC790\uC790\uAC00 \uD655\uC778 \uD544\uC694" \uD45C\uC2DC \uD6C4 \uBD84\uC11D\uC5D0 \uBC18\uC601\uD574\uC8FC\uC138\uC694.\`;

  try {
    const { text, error } = await callClaude(systemPrompt, userMessage, 1000);`
);

writeFileSync("src/lib/claudeApi.ts", src, "utf8");
console.log("Patch applied. Verifying...");

// Quick sanity check
const result = readFileSync("src/lib/claudeApi.ts", "utf8");
const hasGetToday = result.includes("getTodayString");
const hasBuildPrompt = result.includes("buildSystemPrompt");
const hasDateInAnalyze = result.includes("today = getTodayString");
console.log("getTodayString:", hasGetToday ? "OK" : "MISSING");
console.log("buildSystemPrompt:", hasBuildPrompt ? "OK" : "MISSING");
console.log("date in analyzeStock:", hasDateInAnalyze ? "OK" : "MISSING");
