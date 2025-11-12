import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend } from 'k6/metrics';
import { config, randomThinkTime } from '../config.js';

// Custom metric for this journey's duration
const journeyDuration = new Trend('journey_duration_course_explorer', true);

/**
 * Course Explorer Journey
 *
 * User story: A citizen wants to find and explore available courses
 * Steps:
 * 1. Visit home page
 * 2. Navigate to courses section
 * 3. Browse available courses
 * 4. View course FAQ
 * 5. Sometimes search for specific courses
 */
export function courseExplorer() {
  const startTime = Date.now();
  const tags = { journey: 'CourseExplorer' };

  group('Course Explorer Journey', function () {
    // Step 1: Home page
    group('Visit Home', function () {
      const res = http.get(`${config.baseUrl}/`, { tags });
      check(res, {
        'home page status 200': (r) => r.status === 200,
        'home page has content': (r) => r.body.length > 0,
      }, tags);
      sleep(randomThinkTime());
    });

    // Step 2: Navigate to courses
    group('Navigate to Courses', function () {
      const res = http.get(`${config.baseUrl}/servicos/cursos`, { tags });
      check(res, {
        'courses page status 200': (r) => r.status === 200,
        'courses page loaded': (r) => r.body.length > 0,
      }, tags);
      sleep(randomThinkTime());
    });

    // Step 3: Browse course options
    group('Browse Course Options', function () {
      const res = http.get(`${config.baseUrl}/servicos/cursos/opcoes`, { tags });
      check(res, {
        'course options status 200': (r) => r.status === 200,
        'options page loaded': (r) => r.body.length > 0,
      }, tags);
      sleep(randomThinkTime());
    });

    // Step 4: Check FAQ
    group('View Course FAQ', function () {
      const res = http.get(`${config.baseUrl}/servicos/cursos/faq`, { tags });
      check(res, {
        'course faq status 200': (r) => r.status === 200,
        'faq page loaded': (r) => r.body.length > 0,
      }, tags);
      sleep(randomThinkTime());
    });

    // Step 5: Sometimes search for courses (60% chance - course seekers often search)
    if (Math.random() < 0.6) {
      group('Search Courses', function () {
        const res = http.get(`${config.baseUrl}/servicos/cursos/busca`, { tags });
        check(res, {
          'course search status 200': (r) => r.status === 200,
          'search page loaded': (r) => r.body.length > 0,
        }, tags);
        sleep(randomThinkTime());
      });
    }

    // Step 6: View my courses (checking enrollment status)
    group('Check My Courses', function () {
      const res = http.get(`${config.baseUrl}/servicos/cursos/meus-cursos`, { tags });
      check(res, {
        'my courses accessible': (r) => r.status === 200 || r.status === 302,
      }, tags);
      sleep(randomThinkTime());
    });
  });

  // Record journey duration
  const duration = Date.now() - startTime;
  journeyDuration.add(duration, tags);
}
