import { loadEnvFiles } from './load-env'

/**
 * Runs once before all tests. Ensures local env files are loaded when Playwright is spawned
 * without a shell that already sourced them.
 */
export default async function globalSetup() {
  loadEnvFiles()
}
