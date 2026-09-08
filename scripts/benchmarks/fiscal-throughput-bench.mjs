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
 * Phase 6 extension (2026-09-07): also captures system-level metrics
 * (process CPU/RSS, OS free memory, PostgreSQL connections/locks, work_items
 * queue depth and oldest-pending age) around each level, and — unless
 * --no-auto-extend is passed — keeps pushing concurrency upward past the
 * given `--levels` progression until it observes real degradation (rising
 * error rate, or p95/p99 growing well past the previous level), then stops
 * safely and reports first_observed_degradation_concurrency. It also
 * optionally measures backlog drain time (see --measure-drain).
 *
 * Usage:
 *   node scripts/benchmarks/fiscal-throughput-bench.mjs \
 *     --base-url http://127.0.0.1:3100 \
 *     --token "adn_v1...." \
 *     --levels 10,25,50,75,100 \
 *     --requests-per-level 200 \
 *     --pg-container api-dian-postgres \
 *     --pg-db ci \
 *     --measure-drain \
 *     --out docs/experiments/astra-full-build/evidence/bench-<date>.json
 *
 * PostgreSQL system metrics (connections, locks, queue depth, oldest queue
 * age) are OPTIONAL and only captured when --pg-container is given and a
 * `docker exec <container> psql ...` round trip succeeds; if that isn't
 * reachable from this environment, the script says so explicitly in the
 * output (`postgres_metrics.available: false` + the reason) rather than
 * fabricating numbers.
 */

import { performance } from 'node:perf_hooks';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import os from 'node:os';
import { execSync, execFileSync } from 'node:child_process';

function arg(name, fallback) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  return process.argv[idx + 1];
}

function flag(name) {
  return process.argv.includes(`--${name}`);
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
const pgContainer = arg('pg-container', null);
const pgDb = arg('pg-db', 'ci');
const pgUser = arg('pg-user', 'postgres');
const autoExtend = !flag('no-auto-extend');
const maxConcurrency = Number.parseInt(arg('max-concurrency', '800'), 10);
const measureDrain = flag('measure-drain');
const drainTimeoutMs = Number.parseInt(arg('drain-timeout-ms', '120000'), 10);

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

// ---------------------------------------------------------------------
// Optional PostgreSQL system metrics via `docker exec <container> psql`.
// ---------------------------------------------------------------------
let postgresMetricsAvailable = null; // null = not probed yet

function psql(sql) {
  // execFileSync with an argv array (not a shell string) avoids all
  // quoting differences between POSIX sh and Windows cmd.exe — passing a
  // hand-escaped string through execSync() silently produced malformed
  // commands on Windows (cmd.exe does not honor backslash-escaped double
  // quotes the way sh does), which is why every postgres metric sample
  // came back null on Windows until this fix.
  return execFileSync(
    'docker',
    ['exec', pgContainer, 'psql', '-U', pgUser, '-d', pgDb, '-tAc', sql],
    { encoding: 'utf8' },
  ).trim();
}

function probePostgresMetrics() {
  if (!pgContainer) {
    postgresMetricsAvailable = { available: false, reason: 'no --pg-container given' };
    return;
  }
  try {
    psql('SELECT 1');
    postgresMetricsAvailable = { available: true };
  } catch (err) {
    postgresMetricsAvailable = {
      available: false,
      reason: `docker exec psql probe failed: ${String(err).split('\n')[0]}`,
    };
  }
}

function samplePostgresMetrics() {
  if (!postgresMetricsAvailable?.available) return null;
  try {
    const connections = Number(
      psql(
        `SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()`,
      ),
    );
    const locks = Number(psql(`SELECT count(*) FROM pg_locks`));
    const queueRow = psql(
      `SELECT count(*) FILTER (WHERE status IN ('PENDING','CLAIMED','RETRY')),
              COALESCE(EXTRACT(EPOCH FROM (now() - (MIN(available_at) FILTER (WHERE status IN ('PENDING','RETRY'))))), 0)
       FROM app.work_items`,
    );
    const [queueDepthStr, oldestAgeStr] = queueRow.split('|');
    return {
      timestamp: new Date().toISOString(),
      connections,
      locks,
      queue_depth: Number(queueDepthStr ?? 0),
      oldest_pending_age_s: Number(Number(oldestAgeStr ?? 0).toFixed(1)),
    };
  } catch {
    return null;
  }
}

function currentBacklogSize() {
  if (!postgresMetricsAvailable?.available) return null;
  try {
    return Number(
      psql(
        `SELECT count(*) FROM app.work_items WHERE status IN ('PENDING','CLAIMED','RETRY')`,
      ),
    );
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------
// Process/OS resource sampling (no external deps; loadavg is 0 on Windows
// — documented limitation, not a fabricated number).
// ---------------------------------------------------------------------
function sampleProcessAndOs() {
  const mem = process.memoryUsage();
  return {
    timestamp: Date.now(),
    rss_mb: Number((mem.rss / 1024 ** 2).toFixed(1)),
    free_mem_pct: Number(((os.freemem() / os.totalmem()) * 100).toFixed(1)),
    loadavg_1m: os.loadavg()[0],
  };
}

function summarizeSamples(samples, key) {
  const values = samples.map((s) => s[key]).filter((v) => Number.isFinite(v));
  if (values.length === 0) return { min: null, max: null, avg: null };
  const sum = values.reduce((a, b) => a + b, 0);
  return {
    min: Number(Math.min(...values).toFixed(1)),
    max: Number(Math.max(...values).toFixed(1)),
    avg: Number((sum / values.length).toFixed(1)),
  };
}

async function runLevel(concurrency, total) {
  const started = performance.now();
  let inFlight = 0;
  let launched = 0;
  const results = [];
  const resourceSamples = [];
  const pgSamples = [];

  function takeSample() {
    resourceSamples.push(sampleProcessAndOs());
    const pg = samplePostgresMetrics();
    if (pg) pgSamples.push(pg);
  }

  // Take one sample immediately — at high concurrency a burst can finish in
  // under 100ms, faster than any interval tick, so without this the
  // system-metrics columns would be empty for exactly the levels where
  // saturation is most likely to show up.
  takeSample();
  const sampleTimer = setInterval(takeSample, 100);

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

  clearInterval(sampleTimer);

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
    process_rss_mb: summarizeSamples(resourceSamples, 'rss_mb'),
    os_free_mem_pct: summarizeSamples(resourceSamples, 'free_mem_pct'),
    postgres: postgresMetricsAvailable?.available
      ? {
          connections: summarizeSamples(pgSamples, 'connections'),
          locks: summarizeSamples(pgSamples, 'locks'),
          queue_depth: summarizeSamples(pgSamples, 'queue_depth'),
          oldest_pending_age_s: summarizeSamples(pgSamples, 'oldest_pending_age_s'),
        }
      : null,
  };
}

function isDegraded(current, previous, baseline, allPriorResults) {
  if (current.error_rate > 0) return true;
  if (!previous) return false;
  // p99 growing by >1.8x vs the previous level, or >4x vs the very first
  // (lowest-concurrency) level, is treated as real degradation rather than
  // ordinary queueing variance.
  if (current.p99_ms !== null && previous.p99_ms !== null) {
    if (current.p99_ms > previous.p99_ms * 1.8) return true;
  }
  if (baseline?.p99_ms && current.p99_ms && current.p99_ms > baseline.p99_ms * 4) {
    return true;
  }
  if (
    postgresMetricsAvailable?.available &&
    current.postgres?.queue_depth?.max !== null &&
    previous.postgres?.queue_depth?.max !== null &&
    current.postgres.queue_depth.max > previous.postgres.queue_depth.max * 2 &&
    current.postgres.queue_depth.max > 500
  ) {
    // Queue depth growing unbounded (no worker keeping up) is degradation
    // even if HTTP latency itself still looks fine.
    return true;
  }
  // Throughput plateau: concurrency keeps rising (at least doubled since
  // the level that achieved the best throughput so far) but observed
  // throughput has stopped improving (within 10%) while latency keeps
  // climbing. This is real saturation even with 0 errors — the classic
  // signature of a bottleneck resource (DB pool, single event loop, etc.)
  // absorbing extra concurrency as queueing delay instead of more work.
  if (allPriorResults && allPriorResults.length >= 2) {
    const bestThroughput = Math.max(...allPriorResults.map((r) => r.observed_docs_per_s));
    const bestLevel = allPriorResults.find((r) => r.observed_docs_per_s === bestThroughput);
    if (
      bestLevel &&
      current.concurrency >= bestLevel.concurrency * 2 &&
      current.observed_docs_per_s <= bestThroughput * 1.1 &&
      current.p50_ms > bestLevel.p50_ms * 1.3
    ) {
      return true;
    }
  }
  return false;
}

function safeGit(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

async function measureBacklogDrain() {
  if (!postgresMetricsAvailable?.available) {
    return {
      attempted: false,
      reason: 'postgres metrics unavailable (no --pg-container or probe failed)',
    };
  }
  const startBacklog = currentBacklogSize();
  if (startBacklog === null) {
    return { attempted: false, reason: 'could not read starting backlog size' };
  }
  if (startBacklog === 0) {
    return {
      attempted: true,
      start_backlog: 0,
      drained: true,
      drain_time_s: 0,
      note: 'backlog was already 0 when drain measurement started',
    };
  }

  const started = performance.now();
  let remaining = startBacklog;
  while (performance.now() - started < drainTimeoutMs) {
    await new Promise((r) => setTimeout(r, 1000));
    remaining = currentBacklogSize();
    if (remaining === 0) break;
  }
  const elapsedS = Number(((performance.now() - started) / 1000).toFixed(1));
  return {
    attempted: true,
    start_backlog: startBacklog,
    end_backlog: remaining,
    drained: remaining === 0,
    drain_time_s: elapsedS,
    note:
      remaining === 0
        ? 'backlog fully drained by an externally-running worker process'
        : `backlog did NOT fully drain within ${drainTimeoutMs}ms timeout — either no worker is running against this database, or throughput at this backlog size exceeds the timeout window`,
  };
}

async function main() {
  probePostgresMetrics();

  const machine = {
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    cpu_model: os.cpus()[0]?.model ?? 'unknown',
    total_mem_gb: Number((os.totalmem() / 1024 ** 3).toFixed(1)),
    node_version: process.version,
    loadavg_note:
      os.platform() === 'win32'
        ? 'os.loadavg() is always [0,0,0] on Windows; not a real measurement on this OS'
        : undefined,
  };

  const commit = safeGit('git rev-parse HEAD');
  const branch = safeGit('git rev-parse --abbrev-ref HEAD');

  console.log(
    JSON.stringify(
      {
        info: 'starting benchmark',
        baseUrl,
        levels,
        requestsPerLevel,
        autoExtend,
        maxConcurrency,
        postgres_metrics: postgresMetricsAvailable,
        commit,
        branch,
        machine,
      },
      null,
      2,
    ),
  );

  const runResults = [];
  let firstDegradationLevel = null;
  const plannedLevels = [...levels];
  let cursor = 0;

  while (cursor < plannedLevels.length) {
    const level = plannedLevels[cursor];
    const r = await runLevel(level, requestsPerLevel);
    console.log(JSON.stringify({ level_result: r }));
    runResults.push(r);

    if (firstDegradationLevel === null) {
      const priorResults = runResults.slice(0, -1);
      const previous = priorResults.length > 0 ? priorResults[priorResults.length - 1] : null;
      if (isDegraded(r, previous, runResults[0], priorResults)) {
        firstDegradationLevel = level;
      }
    }

    cursor += 1;

    // Auto-extend: once we've exhausted the requested progression without
    // degradation, keep pushing concurrency upward (roughly geometric) to
    // actually find the saturation point, instead of stopping at whatever
    // arbitrary ceiling was passed in.
    if (
      cursor === plannedLevels.length &&
      autoExtend &&
      firstDegradationLevel === null
    ) {
      const nextLevel = Math.round(level * 1.5);
      if (nextLevel <= maxConcurrency && nextLevel > level) {
        plannedLevels.push(nextLevel);
      }
    }

    // brief cool-down between levels so one wave's queue doesn't bleed into the next
    await new Promise((res) => setTimeout(res, 1500));
  }

  const backlogDrain = measureDrain ? await measureBacklogDrain() : { attempted: false, reason: 'not requested (--measure-drain omitted)' };

  const summary = {
    generated_at: new Date().toISOString(),
    commit,
    branch,
    machine,
    provider: 'FakeFiscalProvider (ACCEPT) — no real fiscal provider involved',
    base_url: baseUrl,
    requests_per_level: requestsPerLevel,
    levels_planned: levels,
    levels_actually_run: plannedLevels,
    auto_extend: autoExtend,
    max_concurrency_cap: maxConcurrency,
    postgres_metrics: postgresMetricsAvailable,
    results: runResults,
    first_observed_degradation_concurrency: firstDegradationLevel,
    degradation_note:
      firstDegradationLevel === null
        ? `no degradation observed up to the highest level run (${plannedLevels.at(-1)}); either raise --max-concurrency or this environment saturates above that point`
        : `first real degradation (rising error rate, p99 growth, or unbounded queue depth) observed at concurrency ${firstDegradationLevel}`,
    backlog_drain: backlogDrain,
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
