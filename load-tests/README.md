# Load Testing for Carioca Digital Superapp

This directory contains load testing infrastructure for performance testing and analysis of the Carioca Digital citizen portal.

## Overview

The load testing setup simulates realistic user behavior across 4 distinct user journeys, each representing different citizen use cases. Tests use a ramp-up then sustained load pattern to help tune resources and identify performance bottlenecks.

### User Journeys

| Journey | Weight | Description |
|---------|--------|-------------|
| **Service Seeker** | 35% | Citizens looking for specific services (IPTU, Multas, CAD Rio, etc.) |
| **Course Explorer** | 25% | Citizens browsing and enrolling in courses |
| **Browser** | 25% | Citizens exploring different categories and content |
| **Searcher** | 15% | Citizens who primarily use search functionality |

### Load Pattern

The default test runs for **21 minutes** with the following stages:

```
2 min  → Ramp up to 50 users
5 min  → Sustained at 50 users
2 min  → Ramp up to 100 users
5 min  → Sustained at 100 users
2 min  → Spike to 150 users
3 min  → Sustained at 150 users
2 min  → Ramp down to 0
```

## Directory Structure

```
load-tests/
├── README.md              # This file
├── K8S_SETUP.md           # Kubernetes load testing setup guide
├── config.js              # Test configuration (weights, thresholds, data)
├── main.js                # Main k6 test script
├── requirements.txt       # Python dependencies for analysis
├── journeys/              # User journey implementations
│   ├── service-seeker.js
│   ├── course-explorer.js
│   ├── browser.js
│   └── searcher.js
├── scripts/               # Analysis scripts
│   └── analyze.py         # Generate reports and visualizations
├── data/                  # Test results (JSON)
│   └── results_*.json
└── reports/               # Generated reports and charts
    ├── failures.csv
    ├── journey_comparison.png
    ├── response_time_trends.png
    ├── status_code_distribution.png
    ├── percentile_analysis.png
    └── summary.txt
```

## Prerequisites

All dependencies are managed via Nix flakes. Simply enter the dev shell:

```bash
nix develop
```

This provides:
- **k6** - Load testing tool
- **Python 3.11** with packages:
  - pandas - Data manipulation
  - numpy - Numerical operations
  - matplotlib - Plotting
  - seaborn - Statistical visualizations
- **just** - Command runner

If you don't use Nix, install manually:
- k6: `brew install k6` (macOS)
- Python 3.8+: `python3 --version`
- Python packages: `pip3 install -r load-tests/requirements.txt`
- just: `brew install just` (macOS)

## Quick Start

```bash
# 1. Enter Nix dev shell (if using Nix)
nix develop

# 2. Run load test (21 minutes)
just load-test

# 3. Generate reports and charts
just analyze-results
```

That's it! Two simple commands.

## Large-Scale Load Testing (Kubernetes)

For testing with higher load (hundreds or thousands of VUs), use the Kubernetes-based load testing infrastructure:

**👉 See [K8S_SETUP.md](./K8S_SETUP.md) for complete setup instructions.**

### Quick Start (K8s)

1. **Set up GitHub Actions** (one-time):
   - Configure GitHub environments (`k6-staging`, `k6-production`)
   - Add GCP credentials and cluster details
   - Create private GCS bucket for results

2. **Run load test**:
   - Go to **Actions** → **K6 Load Test (K8s)**
   - Click **Run workflow**
   - Specify parameters:
     - Target URL
     - Peak VUs (e.g., `500`, `1000`)
     - Ramp up/sustained/ramp down times
     - Environment (staging/production)

3. **View results**:
   - Results stored privately in GCS bucket
   - Download and analyze locally with `just analyze-results`

**Benefits over local testing:**
- ✅ Test with thousands of VUs (vs 100-200 locally)
- ✅ Distributed load from Kubernetes cluster
- ✅ No impact on local machine performance
- ✅ Automated cleanup
- ✅ Results stored securely in private GCS bucket

### Manual Execution (without just)

```bash
# Run load test
K6_BASE_URL=http://localhost:3000 k6 run \
    --out json=load-tests/data/results.json \
    load-tests/main.js

# Generate reports
python3 load-tests/scripts/analyze.py \
    load-tests/data/results.json \
    --output load-tests/reports/
```

## Configuration

### Target URL

By default, tests run against `http://localhost:3000`. Override with:

```bash
LOAD_TEST_URL=https://staging.example.com just load-test
```

### Test Duration

Modify `load-tests/config.js` to adjust stages:

```javascript
stages: [
  { duration: '2m', target: 50 },   // Ramp up to 50 users
  { duration: '5m', target: 50 },   // Stay at 50 users
  // ... more stages
],
```

### Journey Weights

Adjust user journey distribution in `config.js`:

```javascript
journeyWeights: {
  serviceSeeker: 35,    // 35% of users
  courseExplorer: 25,   // 25% of users
  browser: 25,          // 25% of users
  searcher: 15,         // 15% of users
},
```

### Performance Thresholds

Set acceptable performance limits in `config.js`:

```javascript
thresholds: {
  'http_req_duration': ['p(95)<3000'],  // 95% under 3 seconds
  'http_req_failed': ['rate<0.05'],     // < 5% error rate
  'checks': ['rate>0.95'],              // > 95% check success
},
```

## Journeys in Detail

### Service Seeker (35%)

Simulates citizens accessing specific city services.

**Steps:**
1. Visit home page
2. Navigate to services page
3. View a popular service (IPTU, Multas, CAD Rio, etc.)
4. Sometimes perform a quick search (50% chance)

**Metrics:**
- Journey duration
- Service detail page load time
- Search API response time

### Course Explorer (25%)

Simulates citizens looking for educational courses.

**Steps:**
1. Visit home page
2. Navigate to courses section
3. Browse course options
4. View course FAQ
5. Sometimes search for specific courses (60% chance)
6. Check enrolled courses

**Metrics:**
- Journey duration
- Course listing load time
- Course search performance

### Browser (25%)

Simulates citizens exploring the portal.

**Steps:**
1. Visit home page
2. Browse services overview
3. Explore 2-3 different categories
4. View FAQ
5. Sometimes visit ombudsman section (30% chance)
6. Sometimes check cookie policy (20% chance)

**Metrics:**
- Journey duration
- Category page load times
- Number of pages visited

### Searcher (15%)

Simulates search-heavy users.

**Steps:**
1. Visit home page
2. Go directly to search
3. Perform 2-4 searches
4. Sometimes browse services after searching (40% chance)
5. Sometimes access a category (50% chance)

**Metrics:**
- Journey duration
- Search API latency
- Search result relevance

## Analysis and Reports

After running a load test, generate comprehensive reports:

```bash
just analyze-results
```

### Generated Reports

#### 1. Failures CSV (NEW!)

`reports/failures.csv`

**Most important for debugging!** CSV file with all failed requests (non-2xx status codes):
- Timestamp
- HTTP status code
- Method (GET, POST, etc.)
- Endpoint (simplified path)
- Full URL
- Journey that triggered the request
- Response time
- Error message
- Error code

**Use case:** Debug specific 400/500 errors. See exactly which endpoints failed and when. Open in Excel/Google Sheets for filtering and analysis.

#### 2. Response Time Trends by Endpoint (UPDATED!)

`reports/response_time_trends.png`

Line chart showing response times over time for the **top 10 most frequently hit endpoints**.

Shows individual pages/endpoints, not journeys - much more actionable for performance optimization.

**Use case:** Identify which specific pages are slow, detect performance degradation for individual endpoints over time.

#### 3. Journey Comparison (Box Plot)

`reports/journey_comparison.png`

Compares performance across all user journeys using box plots showing:
- Median duration
- Quartiles (25th, 75th percentile)
- Min/max values
- Outliers

**Use case:** High-level view of user experience by journey type.

#### 4. Status Code Distribution

`reports/status_code_distribution.png`

Bar chart showing HTTP status codes by journey.

**Use case:** Identify error patterns, failed requests by user journey.

#### 5. Percentile Analysis

`reports/percentile_analysis.png`

Bar chart comparing P50, P75, P90, P95, P99 across journeys.

**Use case:** Understand tail latencies, set SLOs.

#### 6. Summary Report

`reports/summary.txt`

Text report with:
- Journey statistics (count, mean, median, p95, p99, min, max)
- HTTP request statistics
- Status code distribution
- Error rate analysis

**Use case:** Quick overview, sharing with team.

## Integrating with OpenTelemetry

The application has OpenTelemetry instrumentation enabled. To correlate load tests with traces:

1. Start your application with OpenTelemetry enabled:
   ```bash
   OTEL_ENABLED=true npm run dev
   # or in Docker
   docker run --env-file .env -p 3000:3000 your-image
   ```

2. Run load test:
   ```bash
   just load-test
   ```

3. View traces in Signoz:
   - Navigate to Signoz dashboard
   - Filter by time range matching your test
   - Analyze traces for each journey
   - Identify slow operations

4. Cross-reference with k6 reports:
   - Compare journey durations in box plot
   - Match spikes in response time trends with trace data
   - Investigate outliers in trace explorer

## Common Use Cases

### Test Staging Environment

```bash
LOAD_TEST_URL=https://staging.carioca.digital just load-test
just analyze-results
```

### Compare Performance Over Time

```bash
# Test 1
just load-test
just analyze-results
cp load-tests/reports/journey_comparison.png reports/test1_comparison.png

# After changes
just load-test
just analyze-results
cp load-tests/reports/journey_comparison.png reports/test2_comparison.png

# Compare visually or use diff tools
```

### Identify Bottlenecks

1. Run full load test
2. Generate reports
3. Look for:
   - High P95/P99 values → Slow endpoints
   - Increasing response times → Memory leaks, resource exhaustion
   - High error rates → Service failures, rate limiting

### Capacity Planning

Adjust load pattern to find breaking point:

```javascript
// In config.js
stages: [
  { duration: '5m', target: 100 },
  { duration: '5m', target: 200 },
  { duration: '5m', target: 300 },
  { duration: '5m', target: 400 },
  // ... until system fails
],
```

## Troubleshooting

### k6 Not Found

If using Nix:
```bash
nix develop  # This installs k6 automatically
```

Otherwise:
```bash
brew install k6  # macOS
```

### Python Dependencies Missing

If using Nix:
```bash
nix develop  # This installs all Python packages
```

Otherwise:
```bash
pip3 install -r load-tests/requirements.txt
```

### No Results Generated

Check that:
1. k6 test completed successfully
2. JSON output was written to `data/` directory
3. Results file exists: `ls -lh load-tests/data/`

### Empty Graphs

Verify:
1. Test ran long enough to collect data
2. Target URL is accessible
3. No firewall blocking requests

### High Error Rates

Common causes:
- Rate limiting on API endpoints
- External service dependencies down
- Network connectivity issues
- Server resource exhaustion

Check logs and traces in Signoz.

## Best Practices

1. **Use Realistic Data**: Update `searchQueries` and `categories` in `config.js`
2. **Monitor System**: Watch CPU, memory, network during tests
3. **Correlate with Traces**: Use OpenTelemetry to debug slow requests
4. **Version Results**: Keep test results and reports in version control
5. **Test Regularly**: Run load tests on schedule (e.g., weekly)
6. **Set Baselines**: Establish performance baselines for comparison

## Maintenance

### Clean Up Old Results

```bash
rm -rf load-tests/data/*
rm -rf load-tests/reports/*
```

### List Available Results

```bash
ls -lh load-tests/data/
```

### Update Journey Weights

Based on real user analytics, update weights in `config.js`:

```javascript
journeyWeights: {
  serviceSeeker: 40,  // Increased from 35%
  courseExplorer: 20, // Decreased from 25%
  browser: 25,
  searcher: 15,
},
```

### Add New Journey

1. Create journey file in `journeys/`
2. Import in `main.js`
3. Add to journey selection logic
4. Update weights in `config.js`
5. Update documentation

## Contributing

When adding new endpoints or features:

1. Update relevant journey in `journeys/`
2. Add test data to `config.js`
3. Run test to verify: `just load-test`
4. Update this README

## Support

For questions or issues:

1. Check troubleshooting section
2. Review k6 documentation: https://k6.io/docs/
3. Check OpenTelemetry traces in Signoz
4. Contact DevOps team

## License

Same as main project.
