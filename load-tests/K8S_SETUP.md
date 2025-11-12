# Kubernetes Load Testing Setup

This guide explains how to set up and run large-scale k6 load tests on Kubernetes using GitHub Actions.

## Overview

The k6 load tests can run on your GKE cluster using the k6 operator, allowing you to simulate thousands of virtual users. Results are stored privately in Google Cloud Storage.

## Prerequisites

1. **GKE Cluster** with k6 operator installed
2. **GCS Bucket** for storing test results (private)
3. **GitHub Repository Settings** configured with required secrets and variables

## GitHub Setup

### 1. Create GitHub Environments

Create two environments in your repository settings:

- `k6-staging` - for staging environment tests
- `k6-production` - for production environment tests

**Path**: Repository → Settings → Environments → New environment

### 2. Configure Secrets

Add the following secret to **both** environments:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `GCP_CREDENTIALS_JSON` | Service account key JSON with GKE and GCS permissions | `{"type": "service_account", ...}` |

**Required GCP Permissions:**
- `container.clusters.get`
- `container.clusters.getCredentials`
- `storage.objects.create`
- `storage.objects.get`

### 3. Configure Variables

Add the following variables to **each** environment:

#### k6-staging Environment

| Variable Name | Description | Example |
|--------------|-------------|---------|
| `GCP_PROJECT_ID` | Your GCP project ID | `my-project-123` |
| `GKE_CLUSTER_NAME` | GKE cluster name | `superapp-staging-cluster` |
| `GKE_CLUSTER_REGION` | GKE cluster region | `us-central1-a` |
| `K6_NAMESPACE` | Kubernetes namespace for k6 tests | `k6-load-testing` |
| `GCS_RESULTS_BUCKET` | GCS bucket name (without gs://) | `superapp-load-test-results` |

#### k6-production Environment

Same variables as staging, but with production values.

## GCS Bucket Setup

### 1. Create Private Bucket

```bash
# Create bucket (replace with your bucket name)
gsutil mb -p YOUR_PROJECT_ID -c STANDARD -l us-central1 gs://superapp-load-test-results

# Make bucket private (no public access)
gsutil iam ch -d allUsers:objectViewer gs://superapp-load-test-results
```

### 2. Set Lifecycle Policy (Optional)

Automatically delete old test results after 90 days:

```bash
cat > lifecycle.json <<EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {"age": 90}
      }
    ]
  }
}
EOF

gsutil lifecycle set lifecycle.json gs://superapp-load-test-results
```

### 3. Grant Service Account Access

```bash
# Grant storage admin role to service account
gsutil iam ch serviceAccount:YOUR_SERVICE_ACCOUNT@YOUR_PROJECT.iam.gserviceaccount.com:roles/storage.admin \
  gs://superapp-load-test-results
```

## Running Load Tests

### Via GitHub Actions UI

1. Go to **Actions** → **K6 Load Test (K8s)**
2. Click **Run workflow**
3. Fill in parameters:
   - **Target URL**: URL to test (e.g., `https://staging.app.dados.rio`)
   - **Peak VUs**: Maximum virtual users (e.g., `100`, `500`, `1000`)
   - **Ramp Up Time**: Minutes to reach peak VUs (e.g., `2`)
   - **Sustained Time**: Minutes to maintain peak VUs (e.g., `5`)
   - **Ramp Down Time**: Minutes to ramp down to 0 (e.g., `2`)
   - **Environment**: `staging` or `production`
4. Click **Run workflow**

### Test Duration Calculation

Total test duration = Ramp Up + Sustained + Ramp Down

**Example:**
- Ramp Up: 2 minutes
- Sustained: 5 minutes
- Ramp Down: 2 minutes
- **Total: 9 minutes**

## Understanding Results

### Results Location

Results are stored in GCS at:
```
gs://YOUR_BUCKET/load-tests/{environment}/{timestamp}-{test-run-id}/
```

**Files:**
- `*.log` - k6 pod logs
- `*-results.json` - Individual pod k6 results
- `combined-results.json` - Merged results from all pods
- `metadata.json` - Test configuration and metadata

### Viewing Results

#### Option 1: GCS Console

The workflow provides a direct link to the GCS console in the GitHub Actions summary.

#### Option 2: Download and Analyze Locally

```bash
# Download results
gsutil -m cp -r "gs://YOUR_BUCKET/load-tests/staging/20240312-153045-load-test-*" ./results/

# Analyze with Python script
python3 load-tests/scripts/analyze.py results/combined-results.json --output ./reports/
```

#### Option 3: gsutil Command

```bash
# List recent tests
gsutil ls gs://YOUR_BUCKET/load-tests/staging/ | tail -5

# View metadata
gsutil cat gs://YOUR_BUCKET/load-tests/staging/20240312-153045-load-test-*/metadata.json

# Download specific test
gsutil -m cp -r gs://YOUR_BUCKET/load-tests/staging/20240312-153045-load-test-* ./
```

## Troubleshooting

### Workflow Fails at "Authenticate to Google Cloud"

**Cause**: Invalid service account credentials or insufficient permissions.

**Solution:**
1. Verify `GCP_CREDENTIALS_JSON` secret is valid JSON
2. Check service account has required permissions
3. Ensure service account is enabled

### Workflow Fails at "Configure kubectl for GKE"

**Cause**: Cluster not found or insufficient permissions.

**Solution:**
1. Verify `GKE_CLUSTER_NAME` and `GKE_CLUSTER_REGION` are correct
2. Check service account has `container.clusters.getCredentials` permission
3. Ensure cluster exists and is running

### Test Hangs at "Wait for test completion"

**Cause**: k6 TestRun stuck or pods not starting.

**Solution:**
1. Check k6 operator is running: `kubectl get pods -n k6-operator-system`
2. Check TestRun status: `kubectl get testrun -n k6-load-testing`
3. Check pod status: `kubectl get pods -n k6-load-testing`
4. View pod logs: `kubectl logs -n k6-load-testing POD_NAME`

### No Results Uploaded to GCS

**Cause**: Service account lacks GCS permissions.

**Solution:**
1. Verify service account has `storage.objects.create` permission
2. Check bucket name in `GCS_RESULTS_BUCKET` variable
3. Ensure bucket exists and is in the same project

## Advanced Configuration

### Custom Thresholds

Edit `load-tests/config.js` to adjust performance thresholds:

```javascript
thresholds: {
  'http_req_duration': ['p(95)<3000'],  // 95% under 3s
  'http_req_failed': ['rate<0.05'],     // <5% error rate
  'checks': ['rate>0.95'],              // >95% check success
}
```

### Adjust Journey Weights

Edit `load-tests/config.js` to change user behavior distribution:

```javascript
journeyWeights: {
  serviceSeeker: 35,    // 35% of users
  courseExplorer: 25,   // 25% of users
  browser: 25,          // 25% of users
  searcher: 15,         // 15% of users
}
```

### Add Custom User Journeys

1. Create new journey file in `load-tests/journeys/`
2. Update `load-tests/main.js` to import and execute journey
3. Update `.github/workflows/k6-load-test.yaml` to include file in ConfigMap

## Best Practices

1. **Start Small**: Begin with 50-100 VUs, then scale up
2. **Realistic Ramp-Up**: Use gradual ramp-up (2-5 minutes) to avoid overwhelming the system
3. **Sustained Load**: Run sustained load for at least 5 minutes to identify memory leaks
4. **Monitor Resources**: Watch cluster resources during tests (CPU, memory, network)
5. **Compare Results**: Download results and use analysis scripts to compare performance over time
6. **Test Regularly**: Run load tests after significant changes or weekly in production

## Security Notes

- All results are stored in a **private** GCS bucket
- Service account credentials are stored as **GitHub secrets** (encrypted)
- Test results may contain URLs and request data - review before sharing
- Do **NOT** commit service account keys to the repository
- Rotate service account keys regularly (every 90 days)
