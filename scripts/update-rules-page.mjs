import { readFileSync, writeFileSync } from "fs";

// 1) Update CATEGORIES in constants.ts
let constants = readFileSync("src/lib/constants.ts", "utf8");
constants = constants.replace(
  `export const CATEGORIES = ["\uC804\uCCB4", "\uB9E4\uC218 \uC6D0\uCE59", "\uB9E4\uC218 \uD0C0\uC774\uBC0D", "\uB9E4\uC218 \uAE08\uC9C0", "\uB9E4\uB3C4 \uC6D0\uCE59", "\uC885\uBAA9 \uC120\uC815", "\uACC4\uC808 \uC8FC\uC758", "\uAE30\uD0C0"];`,
  `export const CATEGORIES = ["\uC804\uCCB4", "\uB9E4\uC218 \uC6D0\uCE59", "\uB9E4\uC218 \uD0C0\uC774\uBC0D", "\uB9E4\uC218 \uAE08\uC9C0", "\uC7A5\uCD08\uBC18 \uBC95\uCE59", "\uB9E4\uC218 \uD328\uD134", "\uB9E4\uB3C4 \uC6D0\uCE59", "\uB9E4\uB3C4 \uD328\uD134", "\uC885\uBAA9 \uC120\uC815", "\uACC4\uC808 \uC8FC\uC758", "\uAE30\uD0C0"];`
);
writeFileSync("src/lib/constants.ts", constants, "utf8");
console.log("CATEGORIES updated in constants.ts");

// 2) Patch RulesPage.tsx
let rules = readFileSync("src/pages/RulesPage.tsx", "utf8");

// Add new category colors
rules = rules.replace(
  `    "\uAE30\uD0C0": "#6b7280",`,
  `    "\uC7A5\uCD08\uBC18 \uBC95\uCE59": "#f59e0b",
    "\uB9E4\uC218 \uD328\uD134": "#10b981",
    "\uB9E4\uB3C4 \uD328\uD134": "#dc2626",
    "\uAE30\uD0C0": "#6b7280",`
);

// Update subtitle: 22개 → dynamic
rules = rules.replace(
  `\uC9C1\uC811 \uD130\uB4DD\uD55C 22\uAC1C \uC6D0\uCE59 \u00B7 \uB9E4\uC218\u00B7\uB9E4\uB3C4\u00B7\uC885\uBAA9 \uC120\uC815 \uAE30\uC900`,
  `\uC9C1\uC811 \uD130\uB4DD\uD55C {INVESTMENT_RULES.length}\uAC1C \uC6D0\uCE59 \u00B7 \uC7A5\uCD08\uBC18\u00B7\uB9E4\uC218\u00B7\uB9E4\uB3C4 \uD328\uD134 \uC9C4\uD654\uD310`
);

// Update summary card total count: 22 → INVESTMENT_RULES.length
rules = rules.replace(
  `{ label: "\uC804\uCCB4", count: 22, color: "var(--primary)" },`,
  `{ label: "\uC804\uCCB4", count: INVESTMENT_RULES.length, color: "var(--primary)" },`
);

// Update summary card 3rd item to show 매도 패턴 count
rules = rules.replace(
  `{ label: "\uB9E4\uB3C4 \uC6D0\uCE59", count: INVESTMENT_RULES.filter(r => r.category === "\uB9E4\uB3C4 \uC6D0\uCE59").length, color: "#f97316" },`,
  `{ label: "\uB9E4\uB3C4 \uD328\uD134", count: INVESTMENT_RULES.filter(r => r.category === "\uB9E4\uB3C4 \uD328\uD134").length, color: "#dc2626" },`
);

// Update filter button "전체 22" → dynamic
rules = rules.replace(
  `\uC804\uCCB4 22`,
  `\uC804\uCCB4 {INVESTMENT_RULES.length}`
);

// Update tip text "이 22개 규칙" → dynamic
rules = rules.replace(
  `\uC774 22\uAC1C \uADDC\uCE59\uC744 \uBAA8\uB450 \uCCB4\uD06C\uD558\uC5EC AI\uAC00 \uB9E4\uC218/\uD640\uB4DC/\uB9E4\uB3C4\uB97C \uD310\uB2E8\uD569\uB2C8\uB2E4. \uC124\uC815\uC5D0\uC11C Claude API \uD0A4\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.`,
  `\uC774 {INVESTMENT_RULES.length}\uAC1C \uADDC\uCE59(\uC7A5\uCD08\uBC18 \uBC95\uCE59 + \uCC28\uD2B8 \uD328\uD134 \uD3EC\uD568)\uC744 \uBAA8\uB450 \uCCB4\uD06C\uD558\uC5EC AI\uAC00 \uB9E4\uC218/\uD640\uB4DC/\uB9E4\uB3C4\uB97C \uD310\uB2E8\uD569\uB2C8\uB2E4. \uC124\uC815\uC5D0\uC11C Claude API \uD0A4\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.`
);

writeFileSync("src/pages/RulesPage.tsx", rules, "utf8");
console.log("RulesPage.tsx patched.");

// Verify
const result = readFileSync("src/pages/RulesPage.tsx", "utf8");
const hasNewColors = result.includes("\uC7A5\uCD08\uBC18 \uBC95\uCE59");
const hasDynCount = result.includes("INVESTMENT_RULES.length");
console.log("New category colors:", hasNewColors ? "OK" : "MISSING");
console.log("Dynamic count:", hasDynCount ? "OK" : "MISSING");
