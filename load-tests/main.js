/**
 * Main Load Test Script for Carioca Digital Superapp
 *
 * This script simulates realistic user journeys based on weighted probabilities:
 * - Service Seeker: 35% - Citizens looking for specific services (IPTU, Multas, etc.)
 * - Course Explorer: 25% - Citizens browsing and enrolling in courses
 * - Browser: 25% - Citizens exploring different categories and content
 * - Searcher: 15% - Citizens who primarily use search functionality
 *
 * Test Pattern: Ramp-up then sustained load
 * - 2min ramp to 50 users
 * - 5min sustained at 50 users
 * - 2min ramp to 100 users
 * - 5min sustained at 100 users
 * - 2min spike to 150 users
 * - 3min sustained at 150 users
 * - 2min ramp down to 0
 *
 * Total duration: 21 minutes
 *
 * Usage:
 *   k6 run main.js
 *   K6_BASE_URL=https://your-domain.com k6 run main.js
 *   k6 run --out json=data/results.json main.js
 */

import { serviceSeeker } from './journeys/service-seeker.js';
import { courseExplorer } from './journeys/course-explorer.js';
import { browser } from './journeys/browser.js';
import { searcher } from './journeys/searcher.js';
import { config, getJourneyName } from './config.js';

// Test configuration
export const options = {
  stages: config.stages,
  thresholds: config.thresholds,

  // Enable browser metrics
  systemTags: ['status', 'method', 'url', 'name', 'journey'],

  // Summary export
  summaryTrendStats: ['min', 'avg', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
};

// Test setup
export function setup() {
  console.log('========================================');
  console.log('Carioca Digital Load Test');
  console.log('========================================');
  console.log(`Target: ${config.baseUrl}`);
  console.log('Journey Distribution:');
  console.log(`  - Service Seeker: ${config.journeyWeights.serviceSeeker}%`);
  console.log(`  - Course Explorer: ${config.journeyWeights.courseExplorer}%`);
  console.log(`  - Browser: ${config.journeyWeights.browser}%`);
  console.log(`  - Searcher: ${config.journeyWeights.searcher}%`);
  console.log('========================================');
  console.log('');

  return {
    startTime: new Date().toISOString(),
  };
}

// Main VU execution
export default function (data) {
  // Select journey based on weights
  const journey = getJourneyName();

  // Execute the selected journey
  switch (journey) {
    case 'ServiceSeeker':
      serviceSeeker();
      break;
    case 'CourseExplorer':
      courseExplorer();
      break;
    case 'Browser':
      browser();
      break;
    case 'Searcher':
      searcher();
      break;
    default:
      console.error(`Unknown journey: ${journey}`);
  }
}

// Test teardown
export function teardown(data) {
  console.log('');
  console.log('========================================');
  console.log('Load Test Completed');
  console.log('========================================');
  console.log(`Started: ${data.startTime}`);
  console.log(`Ended: ${new Date().toISOString()}`);
  console.log('');
  console.log('Run analysis scripts to generate reports:');
  console.log('  just load-test-report');
  console.log('========================================');
}
