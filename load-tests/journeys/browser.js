import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend } from 'k6/metrics';
import { config, randomItem, randomThinkTime } from './config.js';

// Custom metric for this journey's duration
const journeyDuration = new Trend('journey_duration_browser', true);

/**
 * Browser Journey
 *
 * User story: A citizen exploring the portal, browsing different categories
 * Steps:
 * 1. Visit home page
 * 2. Browse services
 * 3. Explore multiple categories
 * 4. View FAQ
 * 5. Check ombudsman section
 */
export function browser() {
  const startTime = Date.now();
  const tags = { journey: 'Browser' };

  group('Browser Journey', function () {
    // Step 1: Home page
    group('Visit Home', function () {
      const res = http.get(`${config.baseUrl}/`, { tags });
      check(res, {
        'home page status 200': (r) => r.status === 200,
        'home page has content': (r) => r.body.length > 0,
      }, tags);
      sleep(randomThinkTime());
    });

    // Step 2: Services overview
    group('Browse Services', function () {
      const res = http.get(`${config.baseUrl}/servicos`, { tags });
      check(res, {
        'services page status 200': (r) => r.status === 200,
        'services page loaded': (r) => r.body.length > 0,
      }, tags);
      sleep(randomThinkTime());
    });

    // Step 3: Browse multiple categories (2-3 categories)
    const numCategories = Math.floor(Math.random() * 2) + 2; // 2 or 3 categories
    for (let i = 0; i < numCategories; i++) {
      group(`Browse Category ${i + 1}`, function () {
        const category = randomItem(config.categories);
        const res = http.get(`${config.baseUrl}/servicos/categoria/${category}`, { tags });
        check(res, {
          'category page status 200': (r) => r.status === 200,
          'category page loaded': (r) => r.body.length > 0,
        }, tags);
        sleep(randomThinkTime());
      });
    }

    // Step 4: Check FAQ (browsers often look for help)
    group('View FAQ', function () {
      const res = http.get(`${config.baseUrl}/faq`, { tags });
      check(res, {
        'faq page status 200': (r) => r.status === 200,
        'faq page loaded': (r) => r.body.length > 0,
      }, tags);
      sleep(randomThinkTime());
    });

    // Step 5: Sometimes visit ombudsman (30% chance)
    if (Math.random() < 0.3) {
      group('Visit Ombudsman', function () {
        const res = http.get(`${config.baseUrl}/ouvidoria`, { tags });
        check(res, {
          'ombudsman page status 200': (r) => r.status === 200,
          'ombudsman page loaded': (r) => r.body.length > 0,
        }, tags);
        sleep(randomThinkTime());
      });
    }

    // Step 6: Sometimes check cookie policy (20% chance)
    if (Math.random() < 0.2) {
      group('View Cookie Policy', function () {
        const res = http.get(`${config.baseUrl}/politicas-de-uso-de-cookies`, { tags });
        check(res, {
          'cookie policy status 200': (r) => r.status === 200,
          'policy page loaded': (r) => r.body.length > 0,
        }, tags);
        sleep(randomThinkTime());
      });
    }
  });

  // Record journey duration
  const duration = Date.now() - startTime;
  journeyDuration.add(duration, tags);
}
