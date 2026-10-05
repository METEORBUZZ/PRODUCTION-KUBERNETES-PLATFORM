# Backend API Specification & Concurrency Mechanics

The backend service is built with Node.js 22 and TypeScript, prioritizing ACID transaction safety, zero lost votes, health checks, and Prometheus metrics scraping.

---

## 1. REST Endpoints

### `GET /api/votes`
Retrieves current vote tallies and percentage shares.
- **Response 200 OK**:
  ```json
  {
    "cat": 520,
    "dog": 480,
    "total": 1000,
    "catPercentage": 52,
    "dogPercentage": 48
  }
  ```

### `POST /api/vote/cat`
Atomically increments the vote count for **CAT**.
- **Response 200 OK**: Returns updated vote structure.
- **Prometheus Impact**: Increments `votes_total{option="cat"}` by 1.

### `POST /api/vote/dog`
Atomically increments the vote count for **DOG**.
- **Response 200 OK**: Returns updated vote structure.
- **Prometheus Impact**: Increments `votes_total{option="dog"}` by 1.

### `GET /health`
Liveness probe endpoint. Verifies process execution and event-loop uptime.
- **Response 200 OK**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-10-05T00:30:00.000Z",
    "uptime": 142.3
  }
  ```

### `GET /ready`
Readiness probe endpoint. Executes `SELECT 1;` against PostgreSQL connection pool.
- **Response 200 OK**: Database is reachable. Pod receives traffic.
- **Response 503 Service Unavailable**: Database disconnected. Pod removed from Service endpoints.

### `GET /version`
Deployment telemetry and Git commit metadata.
- **Response 200 OK**:
  ```json
  {
    "version": "1.0.0",
    "gitSha": "a1b2c3d",
    "buildTime": "2026-10-05T00:00:00Z",
    "environment": "production"
  }
  ```

### `GET /metrics`
Prometheus standard scraping endpoint exposing:
- `catdog_votes_total{option="cat|dog"}`: Total cast votes counter.
- `catdog_votes_current{option="cat|dog"}`: Gauge reflecting latest database count.
- `catdog_http_requests_total{method, route, code}`: Request volume tracker.
- `catdog_http_request_duration_seconds{method, route, code}`: Latency histogram.

---

## 2. Concurrency Safety & ACID Atomicity

To prevent race conditions during concurrent voting spikes, the backend executes atomic updates directly inside the database engine:

```sql
UPDATE votes 
SET count = count + 1, updated_at = CURRENT_TIMESTAMP 
WHERE option = $1 
RETURNING option, count;
```

This guarantees:
- Row-level lock acquired automatically by PostgreSQL during update.
- No lost updates even if 1,000 requests hit the cluster in the exact same millisecond.
- Strict constraint `CHECK (count >= 0)` enforces non-negative tallies.
