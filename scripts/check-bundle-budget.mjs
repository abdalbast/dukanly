#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const distAssetsDir = path.join(root, "dist", "assets");

const maxEntryKb = Number(process.env.BUNDLE_MAX_ENTRY_KB ?? 700);
const maxTotalJsKb = Number(process.env.BUNDLE_MAX_TOTAL_JS_KB ?? 2500);

function fail(message) {
  console.error(`Bundle budget check failed: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(distAssetsDir)) {
  fail("dist/assets missing. Run `npm run build` before bundle check.");
}

const files = fs.readdirSync(distAssetsDir);
const jsFiles = files.filter((name) => name.endsWith(".js"));

if (jsFiles.length === 0) {
  fail("No JS assets found in dist/assets.");
}

const sizes = jsFiles.map((name) => {
  const filePath = path.join(distAssetsDir, name);
  const bytes = fs.statSync(filePath).size;
  return { name, bytes, kb: bytes / 1024 };
});

const indexCandidates = sizes.filter((f) => /^index-.*\.js$/.test(f.name));
const entry =
  indexCandidates.length > 0
    ? indexCandidates.sort((a, b) => b.bytes - a.bytes)[0]
    : sizes.sort((a, b) => b.bytes - a.bytes)[0];
const totalJsKb = sizes.reduce((sum, file) => sum + file.kb, 0);

if (!entry) {
  fail("Could not determine entry chunk in dist/assets.");
}

if (entry.kb > maxEntryKb) {
  fail(`Entry chunk ${entry.name} is ${entry.kb.toFixed(2)}KB (max ${maxEntryKb}KB).`);
}

if (totalJsKb > maxTotalJsKb) {
  fail(`Total JS size is ${totalJsKb.toFixed(2)}KB (max ${maxTotalJsKb}KB).`);
}

console.log(
  `Bundle budget passed: entry=${entry.name} ${entry.kb.toFixed(2)}KB, totalJs=${totalJsKb.toFixed(2)}KB`,
);
