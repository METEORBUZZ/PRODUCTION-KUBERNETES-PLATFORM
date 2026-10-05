# Testing, Load Generation & Resilience Verification

This guide outlines the validation procedures for verifying concurrency safety, high availability, and disaster recovery.

---

## 1. Concurrency & Data Integrity Load Test

Script: `scripts/load-test.js` (Invoked via `make load-test` or `./scripts/load-test.sh`)

### Test Objective
Verify that under concurrent traffic spikes:
- API maintains 100% availability.
- Database performs atomic increments with zero dropped votes.
- Response latencies (p50, p95, p99) stay within operational thresholds.

### Running the Test
```bash
# Test local backend or Kubernetes Ingress
TARGET_URL="http://localhost:8080" REQUESTS=500 CONCURRENCY=50 make load-test
```

### Verification Criteria
1. Initial vote count is retrieved.
2. 500 requests are fired across 50 concurrent workers (250 Cat, 250 Dog).
3. Final vote count is queried.
4. The delta must equal exactly `+250 Cat`, `+250 Dog`, and `+500 Total`.
5. Script asserts zero discrepancies and exits code `0`.

---

## 2. Pod Failure & Self-Healing Test

Script: `scripts/failure-test.sh`

```bash
# 1. Inspect running backend pods
kubectl get pods -n catdog-platform -l app=catdog-backend

# 2. Simulate sudden node/pod termination
TARGET_POD=$(kubectl get pods -n catdog-platform -l app=catdog-backend -o jsonpath='{.items[0].metadata.name}')
kubectl delete pod $TARGET_POD -n catdog-platform --now

# 3. Observe Kubernetes self-healing
kubectl get pods -n catdog-platform -l app=catdog-backend -w
```
**Expected Outcome**:
- Ingress continues routing traffic to remaining 2 healthy pods without interruption.
- Kubernetes controller detects replica deficit and schedules a replacement pod within 2 seconds.
- Startup and readiness probes pass before the new pod is added to the Service endpoint.

---

## 3. Zero-Downtime Rolling Update & Rollback Verification

```bash
# 1. Trigger rolling update
kubectl set image deployment/catdog-backend backend=catdog-backend:v1.1.0 -n catdog-platform

# 2. Track rollout status in real-time
kubectl rollout status deployment/catdog-backend -n catdog-platform

# 3. If an issue is observed, execute instant rollback
kubectl rollout undo deployment/catdog-backend -n catdog-platform

# 4. Confirm rollback
kubectl rollout status deployment/catdog-backend -n catdog-platform
```
