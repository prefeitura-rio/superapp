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

# Generate analysis reports and charts from load test results
analyze-results results_file="":
    #!/usr/bin/env bash
    set -euo pipefail

    RESULTS_FILE="{{results_file}}"

    # If no file specified, use the latest results file
    if [ -z "$RESULTS_FILE" ]; then
        RESULTS_FILE=$(ls -t {{data_dir}}/results_*.json 2>/dev/null | head -n1)

        if [ -z "$RESULTS_FILE" ]; then
            echo "❌ No results file found in {{data_dir}}/"
            echo "Usage: just analyze-results <results_file>"
            echo "Run 'just load-test' first to generate results"
            exit 1
        fi

        echo "📊 Using latest results file: $RESULTS_FILE"
    fi

    if [ ! -f "$RESULTS_FILE" ]; then
        echo "❌ Results file not found: $RESULTS_FILE"
        exit 1
    fi

    echo "📈 Generating analysis reports and charts..."
    echo ""

    # Run Python analysis script
    python3 {{scripts_dir}}/analyze.py "$RESULTS_FILE" --output {{reports_dir}}

    echo ""
    echo "✓ Reports generated in: {{reports_dir}}/"
    echo ""
    echo "Generated files:"
    echo "  - failures.csv (Detailed failure log - check this for 400/500 errors!)"
    echo "  - journey_comparison.png (Journey duration box plot)"
    echo "  - response_time_trends.png (Response times by endpoint over time)"
    echo "  - status_code_distribution.png (HTTP status codes by journey)"
    echo "  - percentile_analysis.png (Response time percentiles by journey)"
    echo "  - summary.txt (Text summary report)"

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
