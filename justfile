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

    # Extract metrics from log files
    LOG_FILE=$(ls "$RESULTS_DIR"/*.log 2>/dev/null | head -n1)

    if [ -z "$LOG_FILE" ]; then
        echo "❌ No log files found in $RESULTS_DIR"
        exit 1
    fi

    echo "=== Load Test Results ==="
    echo ""

    # Extract and display the summary sections
    if grep -q "THRESHOLDS" "$LOG_FILE"; then
        echo "--- Thresholds ---"
        sed -n '/█ THRESHOLDS/,/█ TOTAL RESULTS/p' "$LOG_FILE" | grep -v "█" | head -n -1
        echo ""
    fi

    if grep -q "TOTAL RESULTS" "$LOG_FILE"; then
        echo "--- Metrics ---"
        sed -n '/█ TOTAL RESULTS/,/^time=/p' "$LOG_FILE" | grep -v "█" | grep -v "^time="
        echo ""
    fi

    # Check for k6 summary file
    if [ -f "$RESULTS_DIR/k6-summary.txt" ]; then
        echo "--- K6 Summary ---"
        cat "$RESULTS_DIR/k6-summary.txt"
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
