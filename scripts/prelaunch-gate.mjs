#!/usr/bin/env node

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const requiredEnvKeys = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PROJECT_ID",
  "FIB_CLIENT_ID",
  "FIB_CLIENT_SECRET",
  "FIB_BASE_URL_STAGE",
  "FIB_BASE_URL_PROD",
  "FIB_ENV_MODE",
  "FIB_CALLBACK_PUBLIC_URL",
  "PAYMENTS_FIB_ENABLED_REGIONS",
  "COD_MAX_AMOUNT_IQD",
  "COD_MAX_DAILY_ORDERS_PER_PHONE",
];

const optionalEnvKeys = ["VITE_SENTRY_DSN"];

const fail = (message) => {
  console.error(`Prelaunch gate failed: ${message}`);
  process.exit(1);
};

const run = (command, options = {}) => {
  console.log(`\n$ ${command}`);
  execSync(command, { stdio: "inherit", ...options });
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const parsed = {
    includeE2E: args.includes("--with-e2e"),
    includeAudit: args.includes("--with-audit"),
    includeLoadtestAssert: args.includes("--with-loadtest-assert"),
  };
  return parsed;
};

const assertEnvPresence = () => {
  const envFile = path.join(process.cwd(), ".env");
  if (fs.existsSync(envFile)) {
    const raw = fs.readFileSync(envFile, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx <= 0) continue;
      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();
      if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  }

  const missingRequired = requiredEnvKeys.filter((key) => !process.env[key]);
  if (missingRequired.length > 0) {
    fail(`Missing required env keys: ${missingRequired.join(", ")}`);
  }

  const hasSupabaseBrowserKey = Boolean(
    process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  );
  if (!hasSupabaseBrowserKey) {
    fail("Missing required env key: set VITE_SUPABASE_ANON_KEY (preferred) or VITE_SUPABASE_PUBLISHABLE_KEY.");
  }

  const missingOptional = optionalEnvKeys.filter((key) => !process.env[key]);
  if (missingOptional.length > 0) {
    console.warn(`Warning: optional env keys not set: ${missingOptional.join(", ")}`);
  }

  console.log("Required env keys are present (values not printed).\n");
};

const assertLoadtestResult = () => {
  const file = process.env.LOADTEST_RESULT_FILE;
  if (!file) fail("LOADTEST_RESULT_FILE is required with --with-loadtest-assert");
  if (!fs.existsSync(file)) fail(`Loadtest result file not found: ${file}`);

  const body = JSON.parse(fs.readFileSync(file, "utf8"));
  const p95Target = Number(process.env.LOADTEST_MAX_P95_MS ?? 3000);
  const failureRateTarget = Number(process.env.LOADTEST_MAX_FAILURE_RATE ?? 0.05);

  const requests = Number(body.requests ?? 0);
  const failed = Number(body.failed ?? 0);
  const p95 = Number(body.p95Ms ?? Number.NaN);

  if (!requests || Number.isNaN(p95)) {
    fail("Loadtest result JSON missing requests or p95Ms fields.");
  }

  const failureRate = failed / requests;

  if (p95 > p95Target) {
    fail(`P95 too high: ${p95}ms > ${p95Target}ms`);
  }

  if (failureRate > failureRateTarget) {
    fail(
      `Failure rate too high: ${(failureRate * 100).toFixed(2)}% > ${(failureRateTarget * 100).toFixed(2)}%`,
    );
  }

  console.log(
    `Loadtest thresholds passed: p95=${p95}ms, failureRate=${(failureRate * 100).toFixed(2)}%`,
  );
};

const main = () => {
  const args = parseArgs();

  run("npm run check:migrations");
  assertEnvPresence();

  if (args.includeAudit) {
    run("npm audit");
  }

  if (process.env.PRELAUNCH_BASE_URL) {
    run("npm run prelaunch:smoke", {
      env: {
        ...process.env,
        PRELAUNCH_BASE_URL: process.env.PRELAUNCH_BASE_URL,
      },
    });
  } else {
    console.warn("PRELAUNCH_BASE_URL not set. Skipping deployed smoke health check.");
  }

  if (args.includeE2E) {
    if (!process.env.PLAYWRIGHT_BASE_URL) {
      fail("PLAYWRIGHT_BASE_URL is required with --with-e2e");
    }
    run("npm run test:e2e", {
      env: {
        ...process.env,
        PLAYWRIGHT_BASE_URL: process.env.PLAYWRIGHT_BASE_URL,
      },
    });
  }

  if (args.includeLoadtestAssert) {
    assertLoadtestResult();
  }

  console.log("\nPrelaunch gate completed.");
};

main();
