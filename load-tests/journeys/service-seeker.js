import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend } from 'k6/metrics';
import { config, randomItem, randomThinkTime } from './config.js';

// Custom metric for this journey's duration
const journeyDuration = new Trend('journey_duration_service_seeker', true);

/**
 * Service Seeker Journey
 *
 * User story: A citizen needs to access a specific service (IPTU, Multas, etc.)
 * Steps:
 * 1. Visit home page
 * 2. Navigate to services page
 * 3. View a popular service detail
 * 4. Sometimes performs a quick search
 */
export function serviceSeeker() {
  const startTime = Date.now();
  const tags = { journey: 'ServiceSeeker' };

  group('Service Seeker Journey', function () {
    // Step 1: Home page
    group('Visit Home', function () {
      const res = http.get(`${config.baseUrl}/`, { tags });
      check(res, {
        'home page status 200': (r) => r.status === 200,
        'home page has content': (r) => r.body.length > 0,
      }, tags);
      sleep(randomThinkTime());
    });

    // Step 2: Services page
    group('Browse Services', function () {
      const res = http.get(`${config.baseUrl}/servicos`, { tags });
      check(res, {
        'services page status 200': (r) => r.status === 200,
        'services page loaded': (r) => r.body.includes('serviços') || r.body.includes('servicos'),
      }, tags);
      sleep(randomThinkTime());
    });

    // Step 3: Access a popular service
    group('View Popular Service', function () {
      const service = randomItem(config.popularServices);
      const collection = randomItem(config.collections);
      const url = `${config.baseUrl}/servicos/categoria/${service.category}/${service.id}/${collection}`;

      const res = http.get(url, { tags });
      check(res, {
        'service detail status 200': (r) => r.status === 200,
        'service detail loaded': (r) => r.body.length > 0,
      }, tags);
      sleep(randomThinkTime());
    });

    // Step 4: Sometimes search for another service (50% chance)
    if (Math.random() < 0.5) {
      group('Quick Search', function () {
        const query = randomItem(config.searchQueries);
        const res = http.get(`${config.baseUrl}/api/search?q=${encodeURIComponent(query)}`, { tags });
        check(res, {
          'search api status 200': (r) => r.status === 200,
          'search returned results': (r) => {
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
  });

  // Record journey duration
  const duration = Date.now() - startTime;
  journeyDuration.add(duration, tags);
}
