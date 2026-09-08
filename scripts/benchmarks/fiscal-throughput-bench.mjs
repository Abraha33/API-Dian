#!/usr/bin/env node
/**
 * Reproducible fiscal-operations throughput benchmark.
 *
 * Runs a fixed-count request burst against a running API-DIAN instance for
 * each target rate in a progression (default 10/25/50/75/100 req/s "shape",
 * expressed as concurrency waves) and records latency percentiles, error
 * rate and wall-clock throughput. It is provider-neutral: point it at an API
 * instance wired to FakeFiscalProvider (FAKE_PROVIDER_SCENARIO=ACCEPT) —
 * never at a real fiscal provider.
 *
 * Usage:
 *   node scripts/benchmarks/fiscal-throughput-bench.mjs \
 *     --base-url http://127.0.0.1:3100 \
 *     --token "adn_v1...." \
 *     --levels 10,25,50,75,100 \
 *     --requests-per-level 200 \
 *     --out docs/experiments/astra-full-build/evidence/bench-<date>.json
 *
 * Each level fires `requests-per-level` POSTs at the given concurrency
 * (an approximation of req/s: with ~150-300ms typical latency, concurrency N
 * sustains roughly N / (latency_s) req/s — the script reports the *observed*
 * throughput, not just the requested concurrency, so read observed_docs_per_s
 * as the real number).
 */

import { performance } from 'node:perf_hooks';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';

function arg(name, fallback) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  return process.argv[idx + 1];
}

const baseUrl = arg('base-url', 'http://127.0.0.1:3100');
const token = arg(
  'token',
  'adn_v1.aaaaaaaa-0000-4000-8000-000000000001.BwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwc',
);
const levels = arg('levels', '10,25,50,75,100')
  .split(',')
  .map((n) => Number.parseInt(n, 10));
const requestsPerLevel = Number.parseInt(arg('requests-per-level', '200'), 10);
const outPath = arg('out', null);

function commandFor(ref) {
  return {
    schema_version: '1.0',
    document_kind: 'FEV',
    client_reference: ref,
    occurred_at: '2026-08-18T22:30:10-05:00',
    currency: 'COP',
    document: {
      lines: [
        {
          line_no: 1,
          description: 'benchmark',
          quantity: '1.00',
          unit_price: '1.00',
        },
      ],
      totals: { net: '1.00', taxes: '0.00', payable: '1.00' },
    },
  };
}

function percentile(sortedLatencies, p) {
  if (sortedLatencies.length === 0) return null;
  const idx = Math.min(
    sortedLatencies.length - 1,
    Math.ceil(sortedLatencies.length * p) - 1,
  );
  return Number(sortedLatencies[idx].toFixed(1));
}

async function runLevel(concurrency, total) {
  const started = performance.now();
  let inFlight = 0;
  let launched = 0;
  const results = [];

  async function launchOne() {
    const i = launched++;
    const t0 = performance.now();
    const runId = `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`;
    try {
      const response = await fetch(`${baseUrl}/v1/fiscal-operations`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Idempotency-Key': `bench-${runId}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commandFor(`bench-${runId}`)),
      });
      results.push({ status: response.status, ms: performance.now() - t0 });
    } catch (err) {
      results.push({ status: 0, ms: performance.now() - t0, error: String(err) });
    }
  }

  await new Promise((resolve) => {
    function pump() {
      while (inFlight < concurrency && launched < total) {
        inFlight++;
        launchOne().finally(() => {
          inFlight--;
          if (launched >= total && inFlight === 0) resolve();
          else pump();
        });
      }
    }
    pump();
  });

  const elapsedMs = performance.now() - started;
  const latencies = results.map((r) => r.ms).sort((a, b) => a - b);
  const ok = results.filter((r) => r.status === 202).length;
  const errors = results.filter((r) => r.status !== 202).length;

  return {
    concurrency,
    total,
    ok,
    errors,
    error_rate: Number((errors / total).toFixed(4)),
    elapsed_ms: Number(elapsedMs.toFixed(1)),
    observed_docs_per_s: Number((total / (elapsedMs / 1000)).toFixed(2)),
    p50_ms: percentile(latencies, 0.5),
    p95_ms: percentile(latencies, 0.95),
    p99_ms: percentile(latencies, 0.99),
    max_ms: latencies.length ? Number(latencies.at(-1).toFixed(1)) : null,
  };
}

function safeGit(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

async function main() {
  const machine = {
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    cpu_model: os.cpus()[0]?.model ?? 'unknown',
    total_mem_gb: Number((os.totalmem() / 1024 ** 3).toFixed(1)),
    node_version: process.version,
  };

  const commit = safeGit('git rev-parse HEAD');
  const branch = safeGit('git rev-parse --abbrev-ref HEAD');

  console.log(
    JSON.stringify(
      { info: 'starting benchmark', baseUrl, levels, requestsPerLevel, commit, branch, machine },
      null,
      2,
    ),
  );

  const runResults = [];
  let firstDegradationLevel = null;

  for (const level of levels) {
    const r = await runLevel(level, requestsPerLevel);
    console.log(JSON.stringify({ level_result: r }));
    if (
      firstDegradationLevel === null &&
      (r.error_rate > 0 || (runResults.length && r.p95_ms > runResults[runResults.length - 1].p95_ms * 1.5))
    ) {
      firstDegradationLevel = level;
    }
    runResults.push(r);
    // brief cool-down between levels so one wave's queue doesn't bleed into the next
    await new Promise((res) => setTimeout(res, 1500));
  }

  const summary = {
    generated_at: new Date().toISOString(),
    commit,
    branch,
    machine,
    provider: 'FakeFiscalProvider (ACCEPT) — no real fiscal provider involved',
    base_url: baseUrl,
    requests_per_level: requestsPerLevel,
    levels,
    results: runResults,
    first_observed_degradation_concurrency: firstDegradationLevel,
  };

  console.log(JSON.stringify({ summary }, null, 2));

  if (outPath) {
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, JSON.stringify(summary, null, 2));
    console.log(`Saved: ${outPath}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
