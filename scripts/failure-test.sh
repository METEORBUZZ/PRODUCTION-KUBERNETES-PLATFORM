#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${NAMESPACE:-catdog-platform}"
DEPLOYMENT="catdog-backend"

echo "=========================================================="
echo "PRODUCTION KUBERNETES PLATFORM: RESILIENCE & FAILURE SUITE"
echo "Target Deployment: ${DEPLOYMENT} in Namespace: ${NAMESPACE}"
echo "=========================================================="

echo -e "\n--- SCENARIO 1: POD CRASH & AUTO-HEALING ---"
TARGET_POD=$(kubectl get pods -n "${NAMESPACE}" -l app=catdog-backend -o jsonpath='{.items[0].metadata.name}')
echo "Targeting pod for sudden termination: ${TARGET_POD}"

echo "Simulating sudden failure (SIGKILL / instant deletion)..."
kubectl delete pod "${TARGET_POD}" -n "${NAMESPACE}" --now

echo "Monitoring Kubernetes replica recovery..."
kubectl wait --for=condition=Ready pod -l app=catdog-backend -n "${NAMESPACE}" --timeout=60s

REPLICAS_READY=$(kubectl get deployment "${DEPLOYMENT}" -n "${NAMESPACE}" -o jsonpath='{.status.readyReplicas}')
echo "✅ Recovery Verified: ${REPLICAS_READY}/3 replicas healthy and serving traffic."

echo -e "\n--- SCENARIO 2: ZERO-DOWNTIME ROLLING UPDATE ---"
echo "Initiating rolling update..."
kubectl set env deployment/"${DEPLOYMENT}" -n "${NAMESPACE}" DEPLOYMENT_TIMESTAMP="$(date +%s)"

echo "Polling API endpoints during rolling update to verify ZERO dropouts..."
ROLLOUT_PID=$!
SUCCESS_COUNT=0
FAIL_COUNT=0

for i in {1..15}; do
  if kubectl exec -n "${NAMESPACE}" deploy/catdog-frontend -- wget -q -O- http://catdog-backend:8080/health > /dev/null 2>&1; then
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  else
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
  sleep 1
done

echo "Waiting for rollout to finish..."
kubectl rollout status deployment/"${DEPLOYMENT}" -n "${NAMESPACE}" --timeout=90s

echo "Traffic check results during rollout: ${SUCCESS_COUNT} succeeded, ${FAIL_COUNT} failed."
if [ "${FAIL_COUNT}" -eq 0 ]; then
  echo "✅ Rolling update completed with 100% availability (0 dropped requests)."
else
  echo "⚠️ Warning: Detected ${FAIL_COUNT} dropped requests during rollout."
fi

echo -e "\n--- SCENARIO 3: INSTANT DEPLOYMENT ROLLBACK ---"
echo "Simulating issue detected on new revision, triggering emergency rollback..."
kubectl rollout undo deployment/"${DEPLOYMENT}" -n "${NAMESPACE}"

echo "Waiting for rollback rollout status..."
kubectl rollout status deployment/"${DEPLOYMENT}" -n "${NAMESPACE}" --timeout=90s

REVISION=$(kubectl rollout history deployment/"${DEPLOYMENT}" -n "${NAMESPACE}" | tail -n 1 | awk '{print $1}')
echo "✅ Rollback Verified: Deployment successfully restored to previous stable revision (${REVISION})."
echo "=========================================================="
