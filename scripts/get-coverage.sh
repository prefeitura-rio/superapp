#!/bin/bash
# Extracts coverage percentage from vitest coverage-summary.json
# Usage: ./scripts/get-coverage.sh [path/to/coverage-summary.json]

COVERAGE_FILE="${1:-coverage/coverage-summary.json}"

if [ ! -f "$COVERAGE_FILE" ]; then
  echo "0.0"
  exit 0
fi

PCT=$(jq -r '.total.lines.pct' "$COVERAGE_FILE" 2>/dev/null || echo "0.0")

# Validate it's a number
if ! [[ "$PCT" =~ ^[0-9]+\.?[0-9]*$ ]]; then
  PCT="0.0"
fi

printf "%.1f" "$PCT"
