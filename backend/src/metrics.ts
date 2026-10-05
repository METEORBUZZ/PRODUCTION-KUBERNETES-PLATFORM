import client from 'prom-client';

// Prometheus Registry
export const register = new client.Registry();

// Enable default system metrics (CPU, Memory, Event Loop, GC)
client.collectDefaultMetrics({
  register,
  prefix: 'catdog_',
});

// Custom metrics as specified in requirements:
// votes_total{option="cat"}
// votes_total{option="dog"}
// http_requests_total
// http_request_duration_seconds

export const votesTotal = new client.Counter({
  name: 'votes_total',
  help: 'Total number of votes cast',
  labelNames: ['option'] as const,
  registers: [register],
});

export const votesCurrent = new client.Gauge({
  name: 'votes_current',
  help: 'Current count of votes per option',
  labelNames: ['option'] as const,
  registers: [register],
});

export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests processed',
  labelNames: ['method', 'route', 'code'] as const,
  registers: [register],
});

export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'code'] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

// Function to sync votes metrics from DB
export function updateVoteMetrics(cat: number, dog: number) {
  votesCurrent.set({ option: 'cat' }, cat);
  votesCurrent.set({ option: 'dog' }, dog);
}
