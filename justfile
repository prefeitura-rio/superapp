# Justfile for Carioca Digital Superapp
# https://github.com/casey/just

# Load test configuration
load_test_dir := "load-tests"
data_dir := load_test_dir / "data"
reports_dir := load_test_dir / "reports"
scripts_dir := load_test_dir / "scripts"

# Default target URL (override with LOAD_TEST_URL environment variable)
target_url := env_var_or_default("LOAD_TEST_URL", "http://localhost:3000")

# List all available commands
default:
    @just --list

# ==================== Load Testing ====================

# Download latest load test results from GCS
fetch-results environment="staging":
    #!/usr/bin/env bash
    set -euo pipefail

    echo "📥 Fetching latest load test results from GCS..."
    echo "Environment: {{environment}}"

    # Determine bucket based on environment
    if [ "{{environment}}" = "staging" ]; then
        BUCKET="rj-superapp-staging-k6-results"
    elif [ "{{environment}}" = "production" ]; then
        BUCKET="rj-superapp-k6-results"
    else
        echo "❌ Invalid environment: {{environment}}"
        echo "Valid environments: staging, production"
        exit 1
    fi

    echo "Bucket: $BUCKET"
    echo ""

    # Create data directory
    mkdir -p {{data_dir}}

    # Find latest test results (directories are sorted, get the last one)
    LATEST=$(gsutil ls "gs://${BUCKET}/load-tests/{{environment}}/" | sort | tail -n1)

    if [ -z "$LATEST" ]; then
        echo "❌ No test results found for environment: {{environment}}"
        exit 1
    fi

    TEST_ID=$(basename "$LATEST" | sed 's/\/$//')
    LOCAL_DIR="{{data_dir}}/${TEST_ID}"

    echo "📦 Latest test: $TEST_ID"
    echo "📁 Downloading to: $LOCAL_DIR"
    echo ""

    # Download results
    mkdir -p "$LOCAL_DIR"
    gsutil -m cp -r "${LATEST}*" "$LOCAL_DIR/"

    echo ""
    echo "✓ Results downloaded successfully!"
    echo "📂 Location: $LOCAL_DIR"
    echo ""
    echo "Next step: just analyze-results $LOCAL_DIR"

# Run load test (21 minutes: ramp-up then sustained load)
load-test target=target_url:
    #!/usr/bin/env bash
    set -euo pipefail

    echo "🚀 Starting load test against: {{target}}"
    echo "📊 Test duration: 21 minutes (ramp-up + sustained load)"
    echo ""

    # Create data directory if it doesn't exist
    mkdir -p {{data_dir}}

    # Generate timestamp for results file
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    RESULTS_FILE="{{data_dir}}/results_${TIMESTAMP}.json"

    echo "💾 Results will be saved to: ${RESULTS_FILE}"
    echo ""

    # Run k6 test
    K6_BASE_URL={{target}} k6 run \
        --out json=${RESULTS_FILE} \
        {{load_test_dir}}/main.js

    echo ""
    echo "✓ Load test completed!"
    echo "📁 Results saved to: ${RESULTS_FILE}"
    echo ""
    echo "Next step: just analyze-results"

# Analyze load test results from logs
analyze-results results_dir="":
    #!/usr/bin/env bash
    set -euo pipefail

    RESULTS_DIR="{{results_dir}}"

    # If no directory specified, use the latest results directory
    if [ -z "$RESULTS_DIR" ]; then
        RESULTS_DIR=$(ls -dt {{data_dir}}/*/ 2>/dev/null | head -n1)

        if [ -z "$RESULTS_DIR" ]; then
            echo "❌ No results directory found in {{data_dir}}/"
            echo "Usage: just analyze-results <results_directory>"
            echo "Run 'just fetch-results' first to download results from GCS"
            exit 1
        fi

        echo "📊 Using latest results directory: $RESULTS_DIR"
    fi

    if [ ! -d "$RESULTS_DIR" ]; then
        echo "❌ Results directory not found: $RESULTS_DIR"
        exit 1
    fi

    echo "📈 Analyzing load test results..."
    echo ""

    # Check for metadata
    if [ -f "$RESULTS_DIR/metadata.json" ]; then
        echo "=== Test Configuration ==="
        cat "$RESULTS_DIR/metadata.json" | jq -r '
            "Environment: \(.environment)",
            "Target URL: \(.target_url)",
            "Peak VUs: \(.peak_vus)",
            "Duration: \(.ramp_up_minutes)m ramp-up + \(.sustained_minutes)m sustained + \(.ramp_down_minutes)m ramp-down",
            "GitHub Run: \(.github_run_url)"
        '
        echo ""
    fi

    # Count total log files
    LOG_COUNT=$(ls "$RESULTS_DIR"/*.log 2>/dev/null | wc -l | tr -d ' ')

    if [ "$LOG_COUNT" -eq 0 ]; then
        echo "❌ No log files found in $RESULTS_DIR"
        exit 1
    fi

    echo "=== Load Test Results ==="
    echo ""
    echo "📊 Test executed across $LOG_COUNT k6 worker pods"
    echo ""

    # Aggregate metrics from all log files
    echo "--- Aggregated Metrics (All Pods) ---"
    echo ""

    # Extract key metrics from all logs and aggregate
    TOTAL_CHECKS=0
    TOTAL_CHECKS_PASSED=0
    TOTAL_CHECKS_FAILED=0
    TOTAL_HTTP_REQS=0
    TOTAL_HTTP_FAILED=0
    TOTAL_ITERATIONS=0
    TOTAL_DATA_RECEIVED=0
    TOTAL_DATA_SENT=0

    for LOG in "$RESULTS_DIR"/*.log; do
        # Extract checks
        CHECKS=$(grep "checks_total" "$LOG" 2>/dev/null | tail -1 | awk '{print $2}' || echo "0")
        CHECKS_PASSED=$(grep "checks_succeeded" "$LOG" 2>/dev/null | tail -1 | awk '{print $3}' || echo "0")
        CHECKS_FAILED=$(grep "checks_failed" "$LOG" 2>/dev/null | tail -1 | awk '{print $3}' || echo "0")

        # Extract HTTP metrics
        HTTP_REQS=$(grep "http_reqs\\.\\." "$LOG" 2>/dev/null | tail -1 | awk '{print $2}' || echo "0")
        HTTP_FAILED=$(grep "http_req_failed\\.\\." "$LOG" 2>/dev/null | tail -1 | awk '{print $3}' || echo "0")

        # Extract iterations
        ITERATIONS=$(grep "iterations\\.\\." "$LOG" 2>/dev/null | tail -1 | awk '{print $2}' || echo "0")

        # Sum up
        TOTAL_CHECKS=$((TOTAL_CHECKS + CHECKS))
        TOTAL_CHECKS_PASSED=$((TOTAL_CHECKS_PASSED + CHECKS_PASSED))
        TOTAL_CHECKS_FAILED=$((TOTAL_CHECKS_FAILED + CHECKS_FAILED))
        TOTAL_HTTP_REQS=$((TOTAL_HTTP_REQS + HTTP_REQS))
        TOTAL_HTTP_FAILED=$((TOTAL_HTTP_FAILED + HTTP_FAILED))
        TOTAL_ITERATIONS=$((TOTAL_ITERATIONS + ITERATIONS))
    done

    # Calculate aggregated percentages
    if [ $TOTAL_CHECKS -gt 0 ]; then
        CHECK_PASS_PCT=$(awk "BEGIN {printf \"%.2f\", ($TOTAL_CHECKS_PASSED / $TOTAL_CHECKS) * 100}")
        CHECK_FAIL_PCT=$(awk "BEGIN {printf \"%.2f\", ($TOTAL_CHECKS_FAILED / $TOTAL_CHECKS) * 100}")
    else
        CHECK_PASS_PCT="0.00"
        CHECK_FAIL_PCT="0.00"
    fi

    if [ $TOTAL_HTTP_REQS -gt 0 ]; then
        HTTP_FAIL_PCT=$(awk "BEGIN {printf \"%.2f\", ($TOTAL_HTTP_FAILED / $TOTAL_HTTP_REQS) * 100}")
    else
        HTTP_FAIL_PCT="0.00"
    fi

    # Display aggregated results
    echo "TOTALS ACROSS ALL PODS:"
    echo "  checks_total.........: $TOTAL_CHECKS"
    echo "  checks_succeeded.....: ${CHECK_PASS_PCT}% ($TOTAL_CHECKS_PASSED out of $TOTAL_CHECKS)"
    echo "  checks_failed........: ${CHECK_FAIL_PCT}% ($TOTAL_CHECKS_FAILED out of $TOTAL_CHECKS)"
    echo ""
    echo "  http_reqs............: $TOTAL_HTTP_REQS"
    echo "  http_req_failed......: ${HTTP_FAIL_PCT}%"
    echo ""
    echo "  iterations...........: $TOTAL_ITERATIONS"
    echo ""

    # Show percentiles from first log (these should be similar across pods)
    FIRST_LOG=$(ls "$RESULTS_DIR"/*.log 2>/dev/null | head -n1)
    if [ -n "$FIRST_LOG" ] && grep -q "http_req_duration" "$FIRST_LOG"; then
        echo "LATENCY (from representative pod):"
        grep "http_req_duration\.\.\.\.\.\.\.\.\.\.\.: " "$FIRST_LOG" | tail -1 || true
        echo ""
    fi

    echo "✓ Analysis complete!"
    echo "📂 Full logs available at: $RESULTS_DIR"

# ==================== Development ====================

# Install project dependencies
install:
    @echo "📦 Installing dependencies..."
    npm install

# Run development server
dev:
    @echo "🚀 Starting development server..."
    npm run dev

# Build the application
build:
    @echo "🏗️  Building application..."
    npm run build

# Run tests
test:
    @echo "🧪 Running tests..."
    npm test

# Lint code
lint:
    @echo "🔍 Linting code..."
    npm run lint

# Format code
format:
    @echo "✨ Formatting code..."
    npm run format
