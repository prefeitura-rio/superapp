import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { setupTestEnv } from './mocks/env'
import { server } from './mocks/server'

// Setup test environment variables before anything else
setupTestEnv()

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}))

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn((name: string) => {
      if (name === 'access_token') {
        return { value: 'mock-access-token' }
      }
      return undefined
    }),
    set: vi.fn(),
    delete: vi.fn(),
  })),
  headers: vi.fn(() => new Headers()),
}))

// Mock @/lib/user-info
vi.mock('@/lib/user-info', () => ({
  getUserInfoFromToken: vi.fn().mockResolvedValue({
    cpf: '12345678901',
    name: 'Test User',
  }),
}))

// Setup MSW server
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
