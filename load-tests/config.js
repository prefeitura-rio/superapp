// Load Test Configuration
export const config = {
  // Base URL - override with K6_BASE_URL environment variable
  baseUrl: __ENV.K6_BASE_URL || 'http://localhost:3000',

  // Load test stages - ramp-up then sustained load
  stages: [
    { duration: '1m', target: 100 },   // Ramp up to 50 users
    { duration: '1m', target: 100 },   //
    { duration: '1m', target: 0 },    // Ramp down to 0 users
    // { duration: '2m', target: 50 },   // Ramp up to 50 users
    // { duration: '5m', target: 50 },   // Stay at 50 users for 5 minutes
    // { duration: '2m', target: 100 },  // Ramp up to 100 users
    // { duration: '5m', target: 100 },  // Stay at 100 users for 5 minutes
    // { duration: '2m', target: 150 },  // Spike to 150 users
    // { duration: '3m', target: 150 },  // Maintain spike
    // { duration: '2m', target: 0 },    // Ramp down to 0
  ],

  // Performance thresholds
  thresholds: {
    // 95% of requests should be below 3000ms
    'http_req_duration': ['p(95)<3000'],
    // 99% of requests should be below 5000ms
    'http_req_duration{journey:ServiceSeeker}': ['p(99)<5000'],
    'http_req_duration{journey:CourseExplorer}': ['p(99)<5000'],
    'http_req_duration{journey:Browser}': ['p(99)<5000'],
    'http_req_duration{journey:Searcher}': ['p(99)<5000'],
    // Error rate should be below 5%
    'http_req_failed': ['rate<0.05'],
    // Check success rate should be above 95%
    'checks': ['rate>0.95'],
  },

  // Journey weights - must sum to 100
  journeyWeights: {
    serviceSeeker: 35,    // Most common - citizens looking for specific services
    courseExplorer: 25,   // Popular - citizens browsing courses
    browser: 25,          // Common - citizens exploring categories
    searcher: 15,         // Regular - citizens using search
  },

  // Think time between requests (in seconds)
  thinkTime: {
    min: 1,
    max: 5,
  },

  // Request timeout
  timeout: '30s',

  // Data for realistic requests
  searchQueries: [
    'iptu', 'multa', 'saude', 'educacao', 'cadrio',
    'cadunico', 'alvara', 'licenca', 'transporte', 'emprego',
    'matricula', 'certidao', 'documentos', 'vacina', 'posto de saude'
  ],

  categories: [
    'saude', 'educacao', 'transporte', 'familia',
    'taxas', 'licencas', 'trabalho', 'cultura',
    'esportes', 'seguranca', 'ambiente', 'animais'
  ],

  // Most accessed services (real service IDs from the app)
  popularServices: [
    { category: 'taxas', id: '84702', name: 'IPTU' },
    { category: 'familia', id: '92294', name: 'CAD Rio' },
    { category: 'transporte', id: '71034', name: 'Multas' },
    { category: 'licencas', id: '91037', name: 'Alvará' },
    { category: 'licencas', id: '69823', name: 'Licença Sanitária' },
    { category: 'familia', id: '10244935327515', name: 'CadÚnico' },
    { category: 'taxas', id: '82000', name: 'Dívida Ativa' },
  ],

  collections: ['carioca_digital', '1746', 'prefrio'],
};

// Helper functions
export function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function randomThinkTime() {
  const min = config.thinkTime.min;
  const max = config.thinkTime.max;
  return Math.random() * (max - min) + min;
}

export function getJourneyName() {
  const rand = Math.random() * 100;
  let cumulative = 0;

  if ((cumulative += config.journeyWeights.serviceSeeker) >= rand) {
    return 'ServiceSeeker';
  }
  if ((cumulative += config.journeyWeights.courseExplorer) >= rand) {
    return 'CourseExplorer';
  }
  if ((cumulative += config.journeyWeights.browser) >= rand) {
    return 'Browser';
  }
  return 'Searcher';
}
