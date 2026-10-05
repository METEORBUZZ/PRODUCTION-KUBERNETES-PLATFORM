#!/usr/bin/env bash
set -euo pipefail

TARGET_URL="${TARGET_URL:-http://localhost:8080}"

echo "Running Smoke Tests on ${TARGET_URL}..."

echo -n "1. Checking /health: "
curl -sf "${TARGET_URL}/health" | grep -q "healthy" && echo "PASS (200 OK)" || (echo "FAIL"; exit 1)

echo -n "2. Checking /ready: "
curl -sf "${TARGET_URL}/ready" | grep -q "ready" && echo "PASS (200 OK)" || (echo "FAIL"; exit 1)

echo -n "3. Checking /version: "
curl -sf "${TARGET_URL}/version" | grep -q "version" && echo "PASS (200 OK)" || (echo "FAIL"; exit 1)

echo -n "4. Checking /metrics: "
curl -sf "${TARGET_URL}/metrics" | grep -q "catdog_" && echo "PASS (200 OK)" || (echo "FAIL"; exit 1)

echo -n "5. Checking /api/votes: "
curl -sf "${TARGET_URL}/api/votes" | grep -q "cat" && echo "PASS (200 OK)" || (echo "FAIL"; exit 1)

echo -n "6. Casting Vote for CAT: "
curl -sf -X POST "${TARGET_URL}/api/vote/cat" | grep -q "cat" && echo "PASS (200 OK)" || (echo "FAIL"; exit 1)

echo -n "7. Casting Vote for DOG: "
curl -sf -X POST "${TARGET_URL}/api/vote/dog" | grep -q "dog" && echo "PASS (200 OK)" || (echo "FAIL"; exit 1)

echo -e "\nAll Smoke Tests Passed Successfully!"
