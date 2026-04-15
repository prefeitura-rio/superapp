import { defineConfig, devices } from '@playwright/test'
import { loadEnvFiles } from './e2e/load-env'

loadEnvFiles()

const PORT = process.env.PORT ?? '3000'
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 2,
  workers: 1,
  expect: { timeout: process.env.CI ? 15000 : 15000 },
  reporter: 'html',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // { name: 'firefox', use: { ...  devices['Desktop Firefox'] } },
    // webkit ta dando problema com o upgrade-insecure-requests.
    // TODO: adicionar no futuro.
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: process.env.CI ? 'npm run start' : 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000,
    env: { ...process.env, PORT },
  },
})
