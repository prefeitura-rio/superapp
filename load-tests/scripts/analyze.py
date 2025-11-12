#!/usr/bin/env python3
"""
Load Test Analysis Script

This script analyzes k6 load test results and generates visualizations:
- failures.csv - Detailed CSV log of all failed requests with endpoints and errors
- journey_comparison.png - Journey duration comparison (box plots)
- response_time_trends.png - Response time trends by endpoint over time
- status_code_distribution.png - HTTP status code distribution by journey
- percentile_analysis.png - Response time percentiles by journey
- summary.txt - Text summary report

Usage:
    python scripts/analyze.py data/results.json
    python scripts/analyze.py data/results.json --output reports/
"""

import json
import sys
import argparse
from pathlib import Path
from typing import Dict, List, Any
from collections import defaultdict
from datetime import datetime

import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import pandas as pd
import numpy as np
import seaborn as sns

# Set style for better-looking plots
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (12, 8)
plt.rcParams['font.size'] = 10


class LoadTestAnalyzer:
    """Analyzes k6 load test results and generates visualizations"""

    def __init__(self, results_file: Path, output_dir: Path):
        self.results_file = results_file
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)

        print(f"📊 Loading results from: {results_file}")
        self.data = self._load_results()
        print(f"✓ Loaded {len(self.data)} data points")

    def _load_results(self) -> List[Dict[str, Any]]:
        """Load k6 JSON results"""
        data = []
        with open(self.results_file, 'r') as f:
            for line in f:
                if line.strip():
                    try:
                        data.append(json.loads(line))
                    except json.JSONDecodeError:
                        continue
        return data

    def _extract_journey_durations(self) -> pd.DataFrame:
        """Extract journey duration metrics"""
        journey_data = []

        for entry in self.data:
            if entry.get('type') == 'Point' and entry.get('metric'):
                metric_name = entry['metric']

                # Look for journey duration metrics
                if metric_name.startswith('journey_duration_'):
                    journey_name = metric_name.replace('journey_duration_', '').replace('_', ' ').title()
                    duration_ms = entry['data']['value']

                    journey_data.append({
                        'journey': journey_name,
                        'duration_ms': duration_ms,
                        'timestamp': entry['data']['time']
                    })

        return pd.DataFrame(journey_data)

    def _extract_http_metrics(self) -> pd.DataFrame:
        """Extract HTTP request metrics"""
        http_data = []

        for entry in self.data:
            if entry.get('type') == 'Point':
                metric_name = entry.get('metric', '')

                if metric_name == 'http_req_duration':
                    tags = entry['data'].get('tags', {})
                    journey = tags.get('journey', 'Unknown')
                    status = tags.get('status', '')

                    http_data.append({
                        'journey': journey,
                        'duration_ms': entry['data']['value'],
                        'timestamp': entry['data']['time'],
                        'url': tags.get('url', ''),
                        'status': status,
                        'method': tags.get('method', ''),
                        'name': tags.get('name', ''),
                        'error': tags.get('error', ''),
                        'error_code': tags.get('error_code', ''),
                        'expected_response': tags.get('expected_response', 'true'),
                    })

        return pd.DataFrame(http_data)

    def _simplify_url(self, url: str) -> str:
        """Simplify URL for better grouping - extract path only"""
        if not url:
            return 'unknown'

        try:
            from urllib.parse import urlparse
            parsed = urlparse(url)
            path = parsed.path or '/'

            # Simplify dynamic segments (UUIDs, IDs, etc.)
            import re
            # Replace UUIDs
            path = re.sub(r'/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', '/{uuid}', path, flags=re.I)
            # Replace numeric IDs
            path = re.sub(r'/\d+', '/{id}', path)
            # Replace long alphanumeric strings (likely IDs)
            path = re.sub(r'/[a-zA-Z0-9]{10,}', '/{id}', path)

            return path
        except Exception:
            return url

    def generate_journey_comparison(self):
        """Generate journey duration comparison box plot"""
        print("\n📈 Generating journey comparison chart...")

        df = self._extract_journey_durations()

        if df.empty:
            print("⚠ No journey duration data found")
            return

        # Map journey names to match the chart format
        journey_mapping = {
            'Service Seeker': 'Service\nSeeker',
            'Course Explorer': 'Course\nExplorer',
            'Browser': 'Browser',
            'Searcher': 'Searcher'
        }

        df['journey_label'] = df['journey'].map(journey_mapping).fillna(df['journey'])

        # Define custom colors for each journey
        colors = {
            'Service\nSeeker': '#F8B4B4',    # Light red/pink
            'Course\nExplorer': '#A8D8DC',   # Light cyan
            'Browser': '#87CEEB',            # Sky blue
            'Searcher': '#FFB38A'            # Light orange/peach
        }

        # Create box plot
        fig, ax = plt.subplots(figsize=(14, 8))

        # Get unique journey labels in order
        journey_order = ['Service\nSeeker', 'Course\nExplorer', 'Browser', 'Searcher']
        journey_order = [j for j in journey_order if j in df['journey_label'].unique()]

        # Create box plot with custom colors
        box_parts = ax.boxplot(
            [df[df['journey_label'] == journey]['duration_ms'].values for journey in journey_order],
            labels=journey_order,
            patch_artist=True,
            widths=0.6,
            showfliers=True,
            flierprops=dict(marker='o', markerfacecolor='black', markersize=4, linestyle='none', alpha=0.5)
        )

        # Color each box
        for patch, journey in zip(box_parts['boxes'], journey_order):
            patch.set_facecolor(colors.get(journey, '#CCCCCC'))
            patch.set_alpha(0.7)

        # Customize plot
        ax.set_ylabel('Journey Duration (ms)', fontsize=12, fontweight='bold')
        ax.set_title('User Journey Performance Comparison', fontsize=14, fontweight='bold', pad=20)
        ax.grid(True, alpha=0.3, axis='y')
        ax.set_axisbelow(True)

        # Add value range on y-axis
        ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'{int(x):,}'))

        plt.tight_layout()

        output_file = self.output_dir / 'journey_comparison.png'
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        print(f"✓ Saved: {output_file}")

        # Print statistics
        print("\n📊 Journey Statistics:")
        stats = df.groupby('journey')['duration_ms'].agg(['count', 'mean', 'median', 'min', 'max', 'std'])
        print(stats.round(2))

        plt.close()

    def export_failures_csv(self):
        """Export failed requests to CSV for detailed analysis"""
        print("\n📋 Exporting failures to CSV...")

        df = self._extract_http_metrics()

        if df.empty:
            print("⚠ No HTTP metrics found")
            return

        # Filter for failures (non-2xx status codes)
        df_failures = df[~df['status'].astype(str).str.startswith('2')].copy()

        if df_failures.empty:
            print("✓ No failures found - all requests succeeded!")
            return

        # Convert timestamp to readable format
        df_failures['timestamp_readable'] = pd.to_datetime(df_failures['timestamp']).dt.strftime('%Y-%m-%d %H:%M:%S')

        # Simplify URLs for better readability
        df_failures['endpoint'] = df_failures['url'].apply(self._simplify_url)

        # Select and order columns for CSV
        csv_columns = [
            'timestamp_readable',
            'status',
            'method',
            'endpoint',
            'url',
            'journey',
            'duration_ms',
            'error',
            'error_code',
        ]

        # Only include columns that exist
        csv_columns = [col for col in csv_columns if col in df_failures.columns]

        df_export = df_failures[csv_columns].sort_values('timestamp_readable')

        output_file = self.output_dir / 'failures.csv'
        df_export.to_csv(output_file, index=False)

        print(f"✓ Saved: {output_file}")
        print(f"  Total failures: {len(df_failures)}")

        # Print summary by endpoint
        print("\n  Failures by endpoint:")
        failures_by_endpoint = df_failures.groupby('endpoint').agg({
            'status': 'count',
            'url': 'first'
        }).rename(columns={'status': 'count'})
        for endpoint, row in failures_by_endpoint.iterrows():
            print(f"    {endpoint}: {row['count']} failures")

    def generate_response_time_trends(self):
        """Generate response time trends over time by endpoint"""
        print("\n📈 Generating response time trends by endpoint...")

        df = self._extract_http_metrics()

        if df.empty:
            print("⚠ No HTTP metrics found")
            return

        # Convert timestamp to datetime
        df['time'] = pd.to_datetime(df['timestamp'])

        # Simplify URLs to endpoints
        df['endpoint'] = df['url'].apply(self._simplify_url)

        # Get top 10 most frequently hit endpoints
        top_endpoints = df['endpoint'].value_counts().head(10).index.tolist()

        # Filter to only include top endpoints
        df_filtered = df[df['endpoint'].isin(top_endpoints)].copy()

        if df_filtered.empty:
            print("⚠ No endpoint data to plot")
            return

        # Resample to 10-second intervals and calculate mean
        df_resampled = df_filtered.set_index('time').groupby('endpoint')['duration_ms'].resample('10S').mean().reset_index()

        # Create plot
        fig, ax = plt.subplots(figsize=(16, 8))

        # Use a colormap for better distinction
        colors = plt.cm.tab10(np.linspace(0, 1, len(top_endpoints)))

        for i, endpoint in enumerate(top_endpoints):
            endpoint_data = df_resampled[df_resampled['endpoint'] == endpoint]
            if not endpoint_data.empty:
                ax.plot(endpoint_data['time'], endpoint_data['duration_ms'],
                       label=endpoint, linewidth=2, alpha=0.7, color=colors[i])

        ax.set_xlabel('Time', fontsize=12, fontweight='bold')
        ax.set_ylabel('Response Time (ms)', fontsize=12, fontweight='bold')
        ax.set_title('Response Time Trends by Endpoint (Top 10 Most Hit)', fontsize=14, fontweight='bold', pad=20)
        ax.legend(loc='best', frameon=True, shadow=True, fontsize=9)
        ax.grid(True, alpha=0.3)
        ax.xaxis.set_major_formatter(mdates.DateFormatter('%H:%M:%S'))
        plt.xticks(rotation=45)

        plt.tight_layout()

        output_file = self.output_dir / 'response_time_trends.png'
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        print(f"✓ Saved: {output_file}")
        print(f"  Showing top 10 endpoints by request count")

        plt.close()

    def generate_status_code_distribution(self):
        """Generate HTTP status code distribution"""
        print("\n📈 Generating status code distribution...")

        df = self._extract_http_metrics()

        if df.empty:
            print("⚠ No HTTP metrics found")
            return

        # Count status codes per journey
        status_counts = df.groupby(['journey', 'status']).size().unstack(fill_value=0)

        # Create plot
        fig, ax = plt.subplots(figsize=(12, 6))

        status_counts.plot(kind='bar', ax=ax, stacked=False, width=0.8)

        ax.set_xlabel('Journey', fontsize=12, fontweight='bold')
        ax.set_ylabel('Request Count', fontsize=12, fontweight='bold')
        ax.set_title('HTTP Status Code Distribution by Journey', fontsize=14, fontweight='bold', pad=20)
        ax.legend(title='Status Code', loc='best', frameon=True, shadow=True)
        ax.grid(True, alpha=0.3, axis='y')
        plt.xticks(rotation=45, ha='right')

        plt.tight_layout()

        output_file = self.output_dir / 'status_code_distribution.png'
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        print(f"✓ Saved: {output_file}")

        plt.close()

    def generate_percentile_chart(self):
        """Generate response time percentiles chart"""
        print("\n📈 Generating percentile analysis...")

        df = self._extract_http_metrics()

        if df.empty:
            print("⚠ No HTTP metrics found")
            return

        percentiles = [50, 75, 90, 95, 99]
        journey_percentiles = {}

        for journey in df['journey'].unique():
            journey_data = df[df['journey'] == journey]['duration_ms']
            journey_percentiles[journey] = [np.percentile(journey_data, p) for p in percentiles]

        # Create plot
        fig, ax = plt.subplots(figsize=(12, 6))

        x = np.arange(len(percentiles))
        width = 0.2

        for i, (journey, values) in enumerate(journey_percentiles.items()):
            ax.bar(x + i * width, values, width, label=journey, alpha=0.8)

        ax.set_xlabel('Percentile', fontsize=12, fontweight='bold')
        ax.set_ylabel('Response Time (ms)', fontsize=12, fontweight='bold')
        ax.set_title('Response Time Percentiles by Journey', fontsize=14, fontweight='bold', pad=20)
        ax.set_xticks(x + width * 1.5)
        ax.set_xticklabels([f'P{p}' for p in percentiles])
        ax.legend(loc='best', frameon=True, shadow=True)
        ax.grid(True, alpha=0.3, axis='y')

        plt.tight_layout()

        output_file = self.output_dir / 'percentile_analysis.png'
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        print(f"✓ Saved: {output_file}")

        plt.close()

    def generate_summary_report(self):
        """Generate text summary report"""
        print("\n📝 Generating summary report...")

        df_http = self._extract_http_metrics()
        df_journey = self._extract_journey_durations()

        output_file = self.output_dir / 'summary.txt'

        with open(output_file, 'w') as f:
            f.write("=" * 80 + "\n")
            f.write("LOAD TEST SUMMARY REPORT\n")
            f.write("=" * 80 + "\n\n")

            f.write(f"Results file: {self.results_file}\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")

            # Journey statistics
            if not df_journey.empty:
                f.write("-" * 80 + "\n")
                f.write("JOURNEY DURATION STATISTICS\n")
                f.write("-" * 80 + "\n\n")

                stats = df_journey.groupby('journey')['duration_ms'].agg([
                    ('count', 'count'),
                    ('mean', 'mean'),
                    ('median', 'median'),
                    ('p95', lambda x: np.percentile(x, 95)),
                    ('p99', lambda x: np.percentile(x, 99)),
                    ('min', 'min'),
                    ('max', 'max'),
                ])

                f.write(stats.to_string())
                f.write("\n\n")

            # HTTP statistics
            if not df_http.empty:
                f.write("-" * 80 + "\n")
                f.write("HTTP REQUEST STATISTICS\n")
                f.write("-" * 80 + "\n\n")

                f.write(f"Total requests: {len(df_http)}\n")
                f.write(f"Total journeys: {df_journey['journey'].nunique() if not df_journey.empty else 'N/A'}\n\n")

                # Status code summary
                f.write("Status Code Distribution:\n")
                status_summary = df_http['status'].value_counts()
                for status, count in status_summary.items():
                    percentage = (count / len(df_http)) * 100
                    f.write(f"  {status}: {count} ({percentage:.2f}%)\n")

                f.write("\n")

        print(f"✓ Saved: {output_file}")

    def run_all_analyses(self):
        """Run all analysis and generate all reports"""
        print("\n" + "=" * 80)
        print("LOAD TEST ANALYSIS")
        print("=" * 80)

        self.export_failures_csv()
        self.generate_journey_comparison()
        self.generate_response_time_trends()
        self.generate_status_code_distribution()
        self.generate_percentile_chart()
        self.generate_summary_report()

        print("\n" + "=" * 80)
        print("✓ Analysis complete! Check the reports directory.")
        print("=" * 80)
        print("\nGenerated files:")
        print("  📋 failures.csv - Detailed failure log with endpoints and errors")
        print("  📊 journey_comparison.png - Journey duration comparison")
        print("  📈 response_time_trends.png - Response times by endpoint over time")
        print("  📊 status_code_distribution.png - HTTP status codes by journey")
        print("  📊 percentile_analysis.png - Response time percentiles")
        print("  📄 summary.txt - Summary statistics")


def main():
    parser = argparse.ArgumentParser(description='Analyze k6 load test results')
    parser.add_argument('results_file', type=Path, help='Path to k6 JSON results file')
    parser.add_argument('--output', '-o', type=Path, default=Path('load-tests/reports'),
                        help='Output directory for reports (default: load-tests/reports)')

    args = parser.parse_args()

    if not args.results_file.exists():
        print(f"❌ Error: Results file not found: {args.results_file}")
        sys.exit(1)

    analyzer = LoadTestAnalyzer(args.results_file, args.output)
    analyzer.run_all_analyses()


if __name__ == '__main__':
    main()
