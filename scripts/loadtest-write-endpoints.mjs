#!/usr/bin/env node

const BASE_URL = process.env.LOADTEST_BASE_URL ?? "http://127.0.0.1:54321/functions/v1";
const ENDPOINT = process.env.LOADTEST_ENDPOINT ?? "checkout";
const CONCURRENCY = Number(process.env.LOADTEST_CONCURRENCY ?? 5);
const REQUESTS = Number(process.env.LOADTEST_REQUESTS ?? 50);
const TOKEN = process.env.LOADTEST_BEARER_TOKEN ?? "";

if (!TOKEN) {
  console.error("Missing LOADTEST_BEARER_TOKEN");
  process.exit(1);
}

const url = `${BASE_URL.replace(/\/$/, "")}/${ENDPOINT}`;

function payloadFor(endpoint, index) {
  if (endpoint === "seller-products") {
    return {
      sku: `LT-${index}`,
      title: `Load Test Product ${index}`,
      status: "draft",
      currencyCode: "USD",
      basePrice: 10,
    };
  }

  if (endpoint === "seller-orders") {
    return {
      orderId: `lt-order-${index}`,
      status: "processing",
      fulfillmentStatus: "unfulfilled",
    };
  }

  if (endpoint === "orders") {
    return {
      sourceCartId: `lt-cart-${index}`,
      shippingAddressId: `lt-address-${index}`,
      currencyCode: "USD",
      note: "load-test",
    };
  }

  return {
    cartId: `lt-cart-${index}`,
    shippingAddressId: `lt-address-${index}`,
    paymentMethod: "cod",
    deliveryOption: "standard",
    currencyCode: "IQD",
    clientTotal: 130000,
    regionCode: "KRD",
    countryCode: "IQ",
    customerPhone: `+964750000${String(index).padStart(3, "0")}`,
    lineItems: [
      {
        productRef: `lt-product-${index}`,
        title: `Load Test Product ${index}`,
        quantity: 1,
        unitPrice: 130000,
        currencyCode: "IQD",
      },
    ],
  };
}

async function runOne(index) {
  const started = performance.now();

  const response = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${TOKEN}`,
      "content-type": "application/json",
      "idempotency-key": `loadtest-${index}-${crypto.randomUUID()}`,
    },
    body: JSON.stringify(payloadFor(ENDPOINT, index)),
  });

  const durationMs = performance.now() - started;
  return { ok: response.ok, status: response.status, durationMs };
}

async function worker(indices) {
  const results = [];
  for (const index of indices) {
    results.push(await runOne(index));
  }
  return results;
}

function chunkIndices(total, chunks) {
  const buckets = Array.from({ length: chunks }, () => []);
  for (let i = 0; i < total; i += 1) {
    buckets[i % chunks].push(i);
  }
  return buckets;
}

const startedAt = performance.now();
const buckets = chunkIndices(REQUESTS, CONCURRENCY);
const settled = await Promise.all(buckets.map((bucket) => worker(bucket)));
const results = settled.flat();
const totalMs = performance.now() - startedAt;

const success = results.filter((r) => r.ok).length;
const failed = results.length - success;
const sorted = results.map((r) => r.durationMs).sort((a, b) => a - b);
const p95 = sorted[Math.max(0, Math.floor(sorted.length * 0.95) - 1)] ?? 0;
const avg = results.reduce((sum, r) => sum + r.durationMs, 0) / Math.max(1, results.length);

console.log(
  JSON.stringify(
    {
      endpoint: ENDPOINT,
      requests: REQUESTS,
      concurrency: CONCURRENCY,
      success,
      failed,
      avgMs: Number(avg.toFixed(2)),
      p95Ms: Number(p95.toFixed(2)),
      totalDurationMs: Number(totalMs.toFixed(2)),
    },
    null,
    2,
  ),
);

if (failed > 0) {
  process.exit(1);
}
