#!/usr/bin/env bash
set -euo pipefail

TARGET_URL="${TARGET_URL:-http://localhost:8080}"
REQUESTS="${REQUESTS:-200}"
CONCURRENCY="${CONCURRENCY:-20}"

echo "Executing Concurrency Load Test against ${TARGET_URL}..."
TARGET_URL="${TARGET_URL}" REQUESTS="${REQUESTS}" CONCURRENCY="${CONCURRENCY}" node ./scripts/load-test.js
