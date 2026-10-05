# Observability, Telemetry & Monitoring Architecture

Full-stack observability is implemented using Prometheus and Grafana to track application voting behavior, API traffic, and Kubernetes cluster health.

---

## 1. Metrics Instrumentation

The backend exports Prometheus text format on `/metrics` using `prom-client`:

| Metric Name | Type | Labels | Description |
| :--- | :--- | :--- | :--- |
| `catdog_votes_total` | Counter | `option` (`cat`, `dog`) | Cumulative count of votes cast |
| `catdog_votes_current` | Gauge | `option` (`cat`, `dog`) | Live database count for each character |
| `catdog_http_requests_total` | Counter | `method`, `route`, `code` | Total HTTP requests handled |
| `catdog_http_request_duration_seconds` | Histogram | `method`, `route`, `code` | Latency distribution with buckets |
| `catdog_process_cpu_user_seconds_total` | Counter | - | CPU utilization of the backend process |
| `catdog_nodejs_heap_size_used_bytes` | Gauge | - | Node.js memory footprint |

---

## 2. Grafana Dashboard Panels (`monitoring/grafana/dashboards/catdog-dashboard.json`)

1. **🐱 Cat Votes & 🐶 Dog Votes**: Stat panels displaying real-time counts.
2. **📊 Total Votes**: Aggregated tally across all options.
3. **⚡ Live Voting Rate**: Rate of votes cast per second (`sum(rate(votes_total[1m]))`).
4. **Voting Rate Trends (Cat vs Dog)**: Time-series graph comparing Cat vs Dog momentum.
5. **API Traffic & Error Rates**: Request volume and 5xx error percentage.
6. **Backend p95 & p99 Latency**: 95th and 99th percentile response times in seconds.
7. **Pod CPU & Memory Utilization**: Container working set memory and CPU core usage.
8. **HPA Replicas Available**: Real-time replica count reflecting autoscaling events.

---

## 3. Prometheus Alerting Rules (`monitoring/prometheus/alert-rules.yml`)

- **`CatDogHighErrorRate`**: Triggers if 5xx errors exceed 5% of total requests over 2 minutes. Severity: `CRITICAL`.
- **`CatDogHighLatency`**: Triggers if p95 response time exceeds 500ms over 2 minutes. Severity: `WARNING`.
- **`CatDogPodCrashLooping`**: Triggers if container restarts exceed 2 within 5 minutes. Severity: `CRITICAL`.
- **`CatDogReplicasDegraded`**: Triggers if ready replicas drop below 2. Severity: `CRITICAL`.
