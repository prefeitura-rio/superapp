import {
  isAccessibilityPluginEnabled,
  isVLibrasEnabled,
} from '@/lib/feature-flags'
import { afterEach, describe, expect, test, vi } from 'vitest'

describe('isAccessibilityPluginEnabled', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('is enabled when the flag is "true" (staging build)', () => {
    vi.stubEnv('NEXT_PUBLIC_ACCESSIBILITY_ENABLED', 'true')

    expect(isAccessibilityPluginEnabled()).toBe(true)
  })

  test('is disabled when the flag is "false" (production build)', () => {
    vi.stubEnv('NEXT_PUBLIC_ACCESSIBILITY_ENABLED', 'false')

    expect(isAccessibilityPluginEnabled()).toBe(false)
  })

  test('is disabled when the flag is absent', () => {
    vi.stubEnv('NEXT_PUBLIC_ACCESSIBILITY_ENABLED', undefined)

    expect(isAccessibilityPluginEnabled()).toBe(false)
  })

  test('is disabled for any value other than "true"', () => {
    for (const value of ['', '1', 'TRUE', 'yes', ' true']) {
      vi.stubEnv('NEXT_PUBLIC_ACCESSIBILITY_ENABLED', value)

      expect(isAccessibilityPluginEnabled()).toBe(false)
    }
  })
})

describe('isVLibrasEnabled', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('is enabled when the flag is "true" (staging build)', () => {
    vi.stubEnv('NEXT_PUBLIC_VLIBRAS_ENABLED', 'true')

    expect(isVLibrasEnabled()).toBe(true)
  })

  test('is disabled when the flag is "false" (production build)', () => {
    vi.stubEnv('NEXT_PUBLIC_VLIBRAS_ENABLED', 'false')

    expect(isVLibrasEnabled()).toBe(false)
  })

  test('is disabled when the flag is absent', () => {
    vi.stubEnv('NEXT_PUBLIC_VLIBRAS_ENABLED', undefined)

    expect(isVLibrasEnabled()).toBe(false)
  })

  test('is disabled for any value other than "true"', () => {
    for (const value of ['', '1', 'TRUE', 'yes', ' true']) {
      vi.stubEnv('NEXT_PUBLIC_VLIBRAS_ENABLED', value)

      expect(isVLibrasEnabled()).toBe(false)
    }
  })
})
