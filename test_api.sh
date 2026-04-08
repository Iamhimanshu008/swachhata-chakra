#!/bin/bash
BASE_URL="https://smartwaste-ai-f0i9.onrender.com"

echo "=== SmartWaste AI Backend Tests ==="

echo "\n1. Health Check:"
curl -s "$BASE_URL/health" | python3 -m json.tool

echo "\n2. Get Zones:"
curl -s "$BASE_URL/api/v1/zones" | python3 -m json.tool

echo "\n3. Get Bins:"
curl -s "$BASE_URL/api/v1/bins" | python3 -m json.tool

echo "\n4. Get Recyclers:"
curl -s "$BASE_URL/api/v1/recyclers" | python3 -m json.tool

echo "\n5. Waste Stats:"
curl -s "$BASE_URL/api/v1/analytics/waste-stats" | python3 -m json.tool

echo "\n=== Tests Complete ==="
