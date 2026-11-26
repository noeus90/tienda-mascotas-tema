#!/usr/bin/env node
// Security checks of the theme (SEC-19), run by the CI next to Theme Check. No dependencies.
//   node scripts/security-lint.mjs            → checks; exit 1 with the problems found
//   node scripts/security-lint.mjs --baseline → rewrites scripts/security-baseline.json
// Rules:
//   1. html-sink: innerHTML / outerHTML / insertAdjacentHTML / document.write in assets/*.js. Each
//      file may only have the ones already reviewed (counted in the baseline); a new one fails until
//      someone checks it only gets text the store controls and updates the baseline.
//   2. liquid-in-script: {{ … }} inside a <script> must go through | json (it may close the script
//      or the string otherwise). The reviewed ones (Dawn's routes and texts in theme.liquid, numbers,
//      values already made with | json) are counted in the baseline.
//   3. blank-without-noopener: target="_blank" needs rel="noopener" (Dawn's own ones are counted in
//      the baseline).
//   Rules 1-3 are a ratchet: what is there was reviewed (docs/seguridad-todo.md, SEC-19); a new
//   occurrence in any file fails.
//   4. sample-data: the sample WhatsApp number of SEC-03 must not come back.
//   5. unpinned-action: GitHub Actions only pinned to a full commit SHA (SEC-09).
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const BASELINE = join(ROOT, "scripts/security-baseline.json");
const THEME_DIRS = ["assets", "blocks", "layout", "sections", "snippets", "templates"];

function files(dir, test) {
  const full = join(ROOT, dir);
  if (!existsSync(full)) return [];
  return readdirSync(full, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return files(path, test);
    return test(entry.name) ? [path] : [];
  });
}

const read = (path) => readFileSync(join(ROOT, path), "utf8");
const lineOf = (text, index) => text.slice(0, index).split("\n").length;
// Liquid and JS comments are not code.
const stripLiquidComments = (text) =>
  text.replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, (m) => m.replace(/[^\n]/g, " "));
const stripJsComments = (text) =>
  text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " ")).replace(/(^|[^:\\])\/\/[^\n]*/g, "$1");

const counted = {}; // "rule:file" → count, for the baseline rules
const problems = []; // { rule, file, line, text }

// 1. HTML sinks in the theme's JavaScript.
for (const file of files("assets", (n) => n.endsWith(".js") && !n.endsWith(".min.js"))) {
  const text = stripJsComments(read(file));
  for (const m of text.matchAll(/\.(innerHTML|outerHTML)\s*[+]?=(?!=)|\.insertAdjacentHTML\s*\(|document\.write\s*\(/g)) {
    const key = `html-sink:${file}`;
    counted[key] = (counted[key] || 0) + 1;
    problems.push({ rule: "html-sink", file, line: lineOf(text, m.index), text: m[0] });
  }
}

const liquidFiles = THEME_DIRS.flatMap((dir) => files(dir, (n) => n.endsWith(".liquid")));

// 2. Liquid output inside <script> without | json.
for (const file of liquidFiles) {
  const text = stripLiquidComments(read(file));
  for (const script of text.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
    const start = script.index + script[0].indexOf(script[1]);
    for (const out of script[1].matchAll(/\{\{-?([\s\S]*?)-?\}\}/g)) {
      const expr = out[1];
      if (/\|\s*(json|structured_data)\b/.test(expr)) continue;
      // Numbers and booleans can't break out of a script.
      if (/\|\s*(times|plus|minus|divided_by|modulo|round|ceil|floor|size|abs|at_least|at_most)\b[^|]*$/.test(expr)) continue;
      const key = `liquid-in-script:${file}`;
      counted[key] = (counted[key] || 0) + 1;
      problems.push({ rule: "liquid-in-script", file, line: lineOf(text, start + out.index), text: out[0].trim() });
    }
  }
}

// 3. target="_blank" without noopener.
for (const file of liquidFiles) {
  const text = stripLiquidComments(read(file));
  for (const tag of text.matchAll(/<a\b[^>]*\btarget=["']_blank["'][^>]*>/gi)) {
    if (/\brel=["'][^"']*noopener/i.test(tag[0])) continue;
    const key = `blank-without-noopener:${file}`;
    counted[key] = (counted[key] || 0) + 1;
    problems.push({ rule: "blank-without-noopener", file, line: lineOf(text, tag.index), text: tag[0].slice(0, 80) });
  }
}

// 4. Sample data that must not come back.
for (const file of [...liquidFiles, ...files("assets", (n) => /\.(js|css|liquid)$/.test(n)), ...files("config", (n) => n.endsWith(".json"))]) {
  const text = read(file);
  for (const m of text.matchAll(/wa\.me\/34600000000/g)) {
    problems.push({ rule: "sample-data", file, line: lineOf(text, m.index), text: m[0] });
  }
}

// 5. GitHub Actions pinned to a commit.
for (const file of files(".github/workflows", (n) => /\.ya?ml$/.test(n))) {
  const text = read(file);
  for (const m of text.matchAll(/^\s*-?\s*uses:\s*([^\s#]+)/gm)) {
    const ref = m[1];
    if (ref.startsWith("./") || ref.startsWith("docker://")) continue;
    if (/@[0-9a-f]{40}$/.test(ref)) continue;
    problems.push({ rule: "unpinned-action", file, line: lineOf(text, m.index), text: ref });
  }
}

const BASELINE_RULES = new Set(["html-sink", "liquid-in-script", "blank-without-noopener"]);

if (process.argv.includes("--baseline")) {
  const sorted = Object.fromEntries(Object.entries(counted).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(BASELINE, `${JSON.stringify(sorted, null, 2)}\n`);
  console.log(`Baseline written: ${Object.keys(sorted).length} entries.`);
  process.exit(0);
}

const baseline = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, "utf8")) : {};
const failures = problems.filter((p) => {
  if (!BASELINE_RULES.has(p.rule)) return true;
  const key = `${p.rule}:${p.file}`;
  return (counted[key] || 0) > (baseline[key] || 0);
});
// For the baseline rules, show every occurrence of a file that went over, so the new one is in sight.
const shown = new Set();
for (const p of failures) {
  const id = `${p.rule}:${p.file}:${p.line}`;
  if (shown.has(id)) continue;
  shown.add(id);
  console.log(`${p.file}:${p.line}  [${p.rule}]  ${p.text}`);
}
if (failures.length) {
  const overBaseline = failures.some((p) => BASELINE_RULES.has(p.rule));
  console.log(`\n${shown.size} problem(s).`);
  if (overBaseline)
    console.log(
      "html-sink / liquid-in-script / blank-without-noopener: a file has more than the reviewed ones. If the " +
        "new one is safe (only text the store controls), run: node scripts/security-lint.mjs --baseline",
    );
  process.exit(1);
}
const reviewed = Object.values(baseline).reduce((a, b) => a + b, 0);
console.log(`Security checks passed (${reviewed} reviewed occurrences in the baseline).`);
