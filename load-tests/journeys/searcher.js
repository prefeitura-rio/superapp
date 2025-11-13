import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend } from 'k6/metrics';
import { config, randomItem, randomThinkTime } from './config.js';

// Custom metric for this journey's duration
const journeyDuration = new Trend('journey_duration_searcher', true);

/**
 * Searcher Journey
 *
 * User story: A citizen who primarily uses search to find what they need
 * Steps:
 * 1. Visit home page
 * 2. Go directly to search
 * 3. Perform multiple searches
 * 4. View search results
 * 5. Access a service from search results
 */
export function searcher() {
  const startTime = Date.now();
  const tags = { journey: 'Searcher' };

  group('Searcher Journey', function () {
    // Step 1: Home page
    group('Visit Home', function () {
      const res = http.get(`${config.baseUrl}/`, { tags });
      check(res, {
        'home page status 200': (r) => r.status === 200,
        'home page has content': (r) => r.body.length > 0,
      }, tags);
      sleep(randomThinkTime());
    });

    // Step 2: Navigate to search page
    group('Open Search', function () {
      const res = http.get(`${config.baseUrl}/busca`, { tags });
      check(res, {
        'search page status 200': (r) => r.status === 200,
        'search page loaded': (r) => r.body.length > 0,
      }, tags);
      sleep(randomThinkTime());
    });

    // Step 3-5: Perform multiple searches (2-4 searches)
    const numSearches = Math.floor(Math.random() * 3) + 2; // 2 to 4 searches
    for (let i = 0; i < numSearches; i++) {
      group(`Search ${i + 1}`, function () {
        const query = randomItem(config.searchQueries);
        const res = http.get(`${config.baseUrl}/api/search?q=${encodeURIComponent(query)}`, { tags });

        check(res, {
          'search api status 200': (r) => r.status === 200,
          'search returned data': (r) => {
            try {
              const data = JSON.parse(r.body);
              return data !== null;
            } catch {
              return false;
            }
          },
        }, tags);

        sleep(randomThinkTime());
      });
    }

    // Step 6: Sometimes browse services after searching (40% chance)
    if (Math.random() < 0.4) {
      group('Browse Services', function () {
        const res = http.get(`${config.baseUrl}/servicos`, { tags });
        check(res, {
          'services page status 200': (r) => r.status === 200,
          'services page loaded': (r) => r.body.length > 0,
        }, tags);
        sleep(randomThinkTime());
      });
    }

    // Step 7: Sometimes access a category after search (50% chance)
    if (Math.random() < 0.5) {
      group('View Category from Search', function () {
        const category = randomItem(config.categories);
        const res = http.get(`${config.baseUrl}/servicos/categoria/${category}`, { tags });
        check(res, {
          'category page status 200': (r) => r.status === 200,
          'category page loaded': (r) => r.body.length > 0,
        }, tags);
        sleep(randomThinkTime());
      });
    }
  });

  // Record journey duration
  const duration = Date.now() - startTime;
  journeyDuration.add(duration, tags);
}
