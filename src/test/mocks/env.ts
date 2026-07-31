// Test environment variables
// These mock the API base URLs used by custom-fetch modules

export const TEST_ENV = {
  BASE_API_URL_RMI: 'http://localhost:3001',
  COURSES_BASE_API_URL: 'http://localhost:3002',
  BASE_API_URL_APP_BUSCA_SEARCH: 'http://localhost:3003',
  BASE_API_URL_SUBPAV_OSA_API: 'http://localhost:3004',
  BASE_API_URL_PREF_RIO_CARTA_SERVICOS: 'http://localhost:3008/api/',
  BASE_API_URL_PREF_RIO_CIDADAO: 'http://localhost:3006/api/private/',
  BASE_API_URL_PREF_RIO_CHAMADOS_PUBLICO: 'http://localhost:3007/api/',
  NODE_ENV: 'test',
} as const

export function setupTestEnv(): void {
  for (const [key, value] of Object.entries(TEST_ENV)) {
    process.env[key] = value
  }
}

export function cleanupTestEnv(): void {
  for (const key of Object.keys(TEST_ENV)) {
    delete process.env[key]
  }
}
