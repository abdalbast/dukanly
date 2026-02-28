#!/usr/bin/env node

const baseUrl = process.env.PRELAUNCH_BASE_URL;

if (!baseUrl) {
  console.error("Missing PRELAUNCH_BASE_URL");
  process.exit(1);
}

const normalized = baseUrl.replace(/\/$/, "");
const healthUrl = `${normalized}/healthz.json`;

const healthResponse = await fetch(healthUrl);
if (!healthResponse.ok) {
  console.error(`Health check failed: ${healthResponse.status} ${healthResponse.statusText}`);
  process.exit(1);
}

const health = await healthResponse.json();
if (health.status !== "ok") {
  console.error(`Health payload not ok: ${JSON.stringify(health)}`);
  process.exit(1);
}

console.log(`Health check passed for ${healthUrl}`);
console.log("Run full browser smoke with:");
console.log(`PLAYWRIGHT_BASE_URL=${normalized} npm run test:e2e`);
