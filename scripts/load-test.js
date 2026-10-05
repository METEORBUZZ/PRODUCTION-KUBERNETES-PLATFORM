/**
 * Concurrency & Data Consistency Load Testing Script
 * Tests:
 * - High concurrency API stability
 * - PostgreSQL ACID atomic transaction integrity
 * - Zero lost votes verification
 * - Latency percentile calculation
 */

const http = require('http');

const API_BASE = process.env.TARGET_URL || 'http://localhost:8080';
const TOTAL_REQUESTS = parseInt(process.env.REQUESTS || '200', 10);
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '20', 10);

function sendRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const start = Date.now();

    const req = http.request(
      url,
      {
        method,
        headers: { 'Content-Type': 'application/json' },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          const latency = Date.now() - start;
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve({ statusCode: res.statusCode, data: JSON.parse(body), latency });
            } catch {
              resolve({ statusCode: res.statusCode, raw: body, latency });
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.end();
  });
}

async function runLoadTest() {
  console.log('====================================================');
  console.log(`Starting Concurrency Load Test against: ${API_BASE}`);
  console.log(`Total Requests: ${TOTAL_REQUESTS} | Concurrency: ${CONCURRENCY}`);
  console.log('====================================================\n');

  // 1. Fetch initial vote counts
  const initialRes = await sendRequest('/api/votes');
  const initialData = initialRes.data;
  console.log('[Initial State]:', initialData);

  const catVotesToCast = Math.floor(TOTAL_REQUESTS / 2);
  const dogVotesToCast = TOTAL_REQUESTS - catVotesToCast;

  const tasks = [];
  for (let i = 0; i < catVotesToCast; i++) {
    tasks.push(() => sendRequest('/api/vote/cat', 'POST'));
  }
  for (let i = 0; i < dogVotesToCast; i++) {
    tasks.push(() => sendRequest('/api/vote/dog', 'POST'));
  }

  // Shuffle tasks so cat and dog votes are interleaved concurrently
  tasks.sort(() => Math.random() - 0.5);

  const latencies = [];
  let successfulRequests = 0;
  let failedRequests = 0;

  const startTime = Date.now();

  // Execute in batches of CONCURRENCY
  for (let i = 0; i < tasks.length; i += CONCURRENCY) {
    const batch = tasks.slice(i, i + CONCURRENCY).map((t) =>
      t()
        .then((res) => {
          successfulRequests++;
          latencies.push(res.latency);
        })
        .catch((err) => {
          failedRequests++;
          console.error(`[Request Failed]: ${err.message}`);
        })
    );
    await Promise.all(batch);
  }

  const durationSec = (Date.now() - startTime) / 1000;
  latencies.sort((a, b) => a - b);

  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const avg = Math.round(latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1));

  // 2. Fetch final vote counts
  const finalRes = await sendRequest('/api/votes');
  const finalData = finalRes.data;
  console.log('\n[Final State]:', finalData);

  const actualCatIncrease = finalData.cat - initialData.cat;
  const actualDogIncrease = finalData.dog - initialData.dog;
  const actualTotalIncrease = finalData.total - initialData.total;

  console.log('\n----------------- TEST SUMMARY -----------------');
  console.log(`Duration:            ${durationSec.toFixed(2)} seconds`);
  console.log(`Throughput:          ${(successfulRequests / durationSec).toFixed(1)} req/sec`);
  console.log(`Success:             ${successfulRequests} / ${TOTAL_REQUESTS}`);
  console.log(`Failed:              ${failedRequests}`);
  console.log(`Latency Avg:         ${avg} ms`);
  console.log(`Latency p50:         ${p50} ms`);
  console.log(`Latency p95:         ${p95} ms`);
  console.log(`Latency p99:         ${p99} ms`);
  console.log('---------------- DATA INTEGRITY ----------------');
  console.log(`Expected Cat Delta:  +${catVotesToCast} | Actual: +${actualCatIncrease}`);
  console.log(`Expected Dog Delta:  +${dogVotesToCast} | Actual: +${actualDogIncrease}`);
  console.log(`Expected Total Delta:+${TOTAL_REQUESTS} | Actual: +${actualTotalIncrease}`);

  // Assertions
  if (
    actualCatIncrease === catVotesToCast &&
    actualDogIncrease === dogVotesToCast &&
    actualTotalIncrease === TOTAL_REQUESTS
  ) {
    console.log('\n✅ PASS: 100% Data Consistency Verified. Zero Lost Votes!');
    process.exit(0);
  } else {
    console.error('\n❌ FAIL: Race condition detected! Counts do not match expected delta.');
    process.exit(1);
  }
}

runLoadTest().catch((err) => {
  console.error('[Fatal Error]:', err.message);
  process.exit(1);
});
