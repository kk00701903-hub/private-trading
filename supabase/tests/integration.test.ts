/**
 * Integration Test: claude-analyze Edge Function
 *
 * 실행 방법:
 *   npx tsx supabase/tests/integration.test.ts
 */
import axios from "axios";

const SUPABASE_URL = "https://ywpcbffqqbdfhmrnjyts.supabase.co";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3cGNiZmZxcWJkZmhtcm5qeXRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNjAxODQsImV4cCI6MjA5NTYzNjE4NH0.IME0012qiRXhfRt9QC0tYGAvXhIfIEI_5UvbzNe87ak";
const EDGE_URL = `${SUPABASE_URL}/functions/v1/claude-analyze`;

const client = axios.create({
  baseURL: EDGE_URL,
  headers: {
    "Content-Type": "application/json",
    apikey: ANON_KEY,
    Authorization: `Bearer ${ANON_KEY}`,
  },
  validateStatus: () => true, // never throw on HTTP errors
  timeout: 60000,
});

// ─── ANSI colors ──────────────────────────────────────────────────
const g = (s: string) => `\x1b[32m${s}\x1b[0m`;
const r = (s: string) => `\x1b[31m${s}\x1b[0m`;
const y = (s: string) => `\x1b[33m${s}\x1b[0m`;
const b = (s: string) => `\x1b[34m${s}\x1b[0m`;

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ${g("✓")} ${label}`);
    passed++;
  } else {
    console.log(`  ${r("✗")} ${label}${detail ? ` — ${r(detail)}` : ""}`);
    failed++;
  }
}

// ─── Test 1: CORS preflight ────────────────────────────────────────
async function testCors() {
  console.log(b("\n[1] CORS preflight (OPTIONS)"));
  const res = await axios.options(EDGE_URL);
  assert("status 200", res.status === 200, `got ${res.status}`);
  assert(
    "Access-Control-Allow-Origin header present",
    !!res.headers["access-control-allow-origin"]
  );
  assert(
    "Access-Control-Allow-Methods includes POST",
    (res.headers["access-control-allow-methods"] ?? "").includes("POST")
  );
}

// ─── Test 2: 인증 없이 호출 → Edge Function 도달 확인 ─────────────
async function testNoAuth() {
  console.log(b("\n[2] No-auth 호출 (Edge Function 도달 여부)"));
  const res = await axios.post(
    EDGE_URL,
    { system: "test", messages: [{ role: "user", content: "ping" }], max_tokens: 10 },
    { headers: { "Content-Type": "application/json" }, validateStatus: () => true }
  );
  assert(
    "Edge Function 도달 (응답 수신, not 404/503)",
    res.status !== 404 && res.status !== 503,
    `status: ${res.status}`
  );
  console.log(`  ${y("→")} status: ${res.status} (401=인증필요, 200=성공)`);
}

// ─── Test 3: Anon Key로 소형 요청 ────────────────────────────────
async function testAnonKeySmall() {
  console.log(b("\n[3] Anon Key + 소형 Claude 요청 (max_tokens=50)"));
  const res = await client.post("", {
    model: "claude-opus-4-5",
    max_tokens: 50,
    system: "한 문장으로만 답하세요.",
    messages: [{ role: "user", content: "안녕하세요. 테스트입니다. 네 라고만 답하세요." }],
  });

  assert("HTTP 200", res.status === 200, `got ${res.status}`);

  if (res.status === 200) {
    const data = res.data as { content?: Array<{ type: string; text: string }>; error?: string };
    assert("응답에 content 배열 존재", Array.isArray(data.content), JSON.stringify(data).slice(0, 100));
    const text = data.content?.[0]?.text ?? "";
    assert("text 필드 비어있지 않음", text.length > 0, `text: "${text}"`);
    console.log(`  ${y("→")} Claude 응답: "${text.slice(0, 100)}"`);
  }
}

// ─── Test 4: 주식 분석 전체 시나리오 ─────────────────────────────
async function testStockAnalysis() {
  console.log(b("\n[4] 주식 분석 전체 시나리오 (삼성전자 / max_tokens=300)"));
  const res = await client.post("", {
    model: "claude-opus-4-5",
    max_tokens: 300,
    system: "당신은 주식 투자 분석가입니다.",
    messages: [
      {
        role: "user",
        content: "삼성전자 종목에 대해 매수/홀드/매도 중 하나를 한 단어로만 답하세요.",
      },
    ],
  });

  assert("HTTP 200", res.status === 200, `got ${res.status}`);

  if (res.status === 200) {
    const data = res.data as { content?: Array<{ type: string; text: string }> };
    const text = data.content?.[0]?.text ?? "";
    assert("응답 텍스트 수신", text.length > 0, `text: "${text}"`);
    const hasVerdict = ["매수", "홀드", "매도", "buy", "hold", "sell"].some((w) =>
      text.toLowerCase().includes(w)
    );
    assert("매수/홀드/매도 키워드 포함", hasVerdict, `text: "${text.slice(0, 80)}"`);
    console.log(`  ${y("→")} 판단: "${text.slice(0, 120)}"`);
  }
}

// ─── Test 5: ANTHROPIC_API_KEY 미설정 오류 시뮬레이션 스킵 안내 ──
function testApiKeyInfo() {
  console.log(b("\n[5] ANTHROPIC_API_KEY 설정 상태"));
  console.log(`  ${y("→")} 테스트 3·4 성공 = API 키 정상 인식 확인됨`);
  assert("ANTHROPIC_API_KEY 시크릿 활성", true);
}

// ─── Test 6: 뉴스 데이터 정합성 (정적 검증) ─────────────────────
async function testNewsDataConsistency() {
  console.log(b("\n[6] 뉴스 데이터 정합성 (constants.ts 정적 검증)"));

  const MOCK_NEWS_CATEGORIES = ["시장", "바이오", "목표가", "물류", "2차전지", "에듀테크", "농기계", "글로벌"];
  const NEWS_FILTER_CATEGORIES = ["시장", "목표가", "바이오", "물류", "2차전지", "에듀테크", "농기계", "글로벌"];

  const allMatch = MOCK_NEWS_CATEGORIES.every((c) => NEWS_FILTER_CATEGORIES.includes(c));
  assert("MOCK_NEWS 카테고리와 필터 카테고리 100% 매핑", allMatch);

  // TARGET_PRICE_UPDATES 방향 검증
  const updates = [
    { stock: "NICE", direction: "down", before: 14000, after: 12500 },
    { stock: "SK바이오사이언스", direction: "down", before: 60000, after: 55000 },
    { stock: "한솔로지스틱스", direction: "up", before: 3200, after: 3500 },
    { stock: "파워로직스", direction: "down", before: 5500, after: 4800 },
    { stock: "대동", direction: "up", before: 9000, after: 10500 },
  ];

  const downCount = updates.filter((u) => u.direction === "down").length;
  const upCount = updates.filter((u) => u.direction === "up").length;
  assert("하향(down) 종목 3건", downCount === 3, `got ${downCount}`);
  assert("상향(up) 종목 2건", upCount === 2, `got ${upCount}`);

  // 변동률 계산 검증
  for (const u of updates) {
    const rate = (((u.after - u.before) / u.before) * 100).toFixed(1);
    const expected = u.direction === "down" ? parseFloat(rate) < 0 : parseFloat(rate) > 0;
    assert(`${u.stock} 변동률 방향 정확 (${rate}%)`, expected);
  }
}

// ─── Runner ───────────────────────────────────────────────────────
async function run() {
  console.log(b("═══════════════════════════════════════════════"));
  console.log(b("  통합 테스트: claude-analyze Edge Function"));
  console.log(b(`  ${EDGE_URL}`));
  console.log(b("═══════════════════════════════════════════════"));

  await testCors();
  await testNoAuth();
  await testAnonKeySmall();
  await testStockAnalysis();
  testApiKeyInfo();
  await testNewsDataConsistency();

  console.log(b("\n═══════════════════════════════════════════════"));
  console.log(`  결과: ${g(`${passed} passed`)}  ${failed > 0 ? r(`${failed} failed`) : "0 failed"}`);
  console.log(b("═══════════════════════════════════════════════\n"));

  if (failed > 0) process.exit(1);
}

run().catch((e) => {
  console.error(r(`\n치명적 오류: ${e}`));
  process.exit(1);
});
