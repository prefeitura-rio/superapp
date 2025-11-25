#!/usr/bin/env python3
"""
Generate visualizations from k6 load test results
"""

import sys
import re
from datetime import datetime
from pathlib import Path

# Check for matplotlib
try:
    import matplotlib
    matplotlib.use('Agg')  # Non-interactive backend
    import matplotlib.pyplot as plt
    import matplotlib.dates as mdates
except ImportError:
    print("⚠️  matplotlib not installed - skipping visualizations")
    print("   Install with: pip install matplotlib")
    sys.exit(0)

if len(sys.argv) < 3:
    print("Usage: generate_charts.py <results_dir> <first_log>")
    sys.exit(1)

results_dir = Path(sys.argv[1])
first_log = sys.argv[2]

# Create charts directory
charts_dir = results_dir / "charts"
charts_dir.mkdir(exist_ok=True)

print("📊 Generating charts...")

# 1. Error Timeline Chart
print("  → Error timeline over time...")
error_timeline = {}
with open(first_log, 'r') as f:
    for line in f:
        if 'level=error' in line or 'level=warning' in line:
            match = re.search(r'time="([^"]+)"', line)
            if match:
                timestamp = match.group(1)
                try:
                    dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                    minute = dt.replace(second=0, microsecond=0)
                    error_timeline[minute] = error_timeline.get(minute, 0) + 1
                except:
                    pass

if error_timeline:
    times = sorted(error_timeline.keys())
    counts = [error_timeline[t] for t in times]

    plt.figure(figsize=(14, 6))
    plt.plot(times, counts, linewidth=2, color='#e74c3c', marker='o', markersize=4)
    plt.fill_between(times, counts, alpha=0.3, color='#e74c3c')
    plt.title('Error Rate Over Time (Sample Pod)', fontsize=14, fontweight='bold', pad=20)
    plt.xlabel('Time', fontsize=12)
    plt.ylabel('Errors per Minute', fontsize=12)
    plt.grid(True, alpha=0.3)
    plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%H:%M'))
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(charts_dir / 'error_timeline.png', dpi=150, bbox_inches='tight')
    plt.close()
    print(f"    ✓ Saved: {charts_dir / 'error_timeline.png'}")

# 2. Error Type Distribution
print("  → Error type distribution...")
error_types = {}
with open(first_log, 'r') as f:
    for line in f:
        if 'i/o timeout' in line:
            error_types['I/O Timeout'] = error_types.get('I/O Timeout', 0) + 1
        elif 'TypeError' in line and 'Cannot read property' in line:
            error_types['TypeError (null check)'] = error_types.get('TypeError (null check)', 0) + 1
        elif 'connection refused' in line:
            error_types['Connection Refused'] = error_types.get('Connection Refused', 0) + 1
        elif 'connection reset' in line:
            error_types['Connection Reset'] = error_types.get('Connection Reset', 0) + 1

if error_types:
    types = list(error_types.keys())
    counts = list(error_types.values())
    colors = ['#e74c3c', '#3498db', '#f39c12', '#9b59b6'][:len(types)]

    plt.figure(figsize=(10, 6))
    plt.pie(counts, labels=types, autopct='%1.1f%%', colors=colors, startangle=90)
    plt.title('Error Distribution by Type (Sample Pod)', fontsize=14, fontweight='bold', pad=20)
    plt.tight_layout()
    plt.savefig(charts_dir / 'error_distribution.png', dpi=150, bbox_inches='tight')
    plt.close()
    print(f"    ✓ Saved: {charts_dir / 'error_distribution.png'}")

# 3. Journey Errors Comparison (extract from all logs)
print("  → Error comparison by journey...")
journey_errors = {}
for log_file in results_dir.glob('*.log'):
    with open(log_file, 'r') as f:
        for line in f:
            if 'TypeError' in line:
                if 'service-seeker.js' in line:
                    journey_errors['Service\nSeeker'] = journey_errors.get('Service\nSeeker', 0) + 1
                elif 'course-explorer.js' in line:
                    journey_errors['Course\nExplorer'] = journey_errors.get('Course\nExplorer', 0) + 1
                elif 'browser.js' in line:
                    journey_errors['Browser'] = journey_errors.get('Browser', 0) + 1
                elif 'searcher.js' in line:
                    journey_errors['Searcher'] = journey_errors.get('Searcher', 0) + 1

if journey_errors:
    journeys = list(journey_errors.keys())
    counts = list(journey_errors.values())
    colors = ['#F8B4B4', '#A8D8DC', '#87CEEB', '#FFB38A'][:len(journeys)]

    plt.figure(figsize=(10, 6))
    bars = plt.bar(journeys, counts, color=colors, alpha=0.8, width=0.6)
    plt.title('TypeError Failures by User Journey (All Pods)', fontsize=14, fontweight='bold', pad=20)
    plt.xlabel('Journey', fontsize=12)
    plt.ylabel('Number of TypeErrors', fontsize=12)
    plt.grid(True, alpha=0.3, axis='y')

    # Add value labels on bars
    for bar in bars:
        height = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2., height,
                f'{int(height):,}',
                ha='center', va='bottom', fontweight='bold')

    plt.tight_layout()
    plt.savefig(charts_dir / 'journey_errors.png', dpi=150, bbox_inches='tight')
    plt.close()
    print(f"    ✓ Saved: {charts_dir / 'journey_errors.png'}")

print("")
print(f"✓ Charts saved to: {charts_dir}")
print("")
