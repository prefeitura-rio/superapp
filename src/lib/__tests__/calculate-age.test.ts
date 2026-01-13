import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { calculateAge } from '@/lib/calculate-age'

describe('calculateAge', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-11'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('invalid inputs', () => {
    test('returns null for undefined', () => {
      const result = calculateAge(undefined)

      expect(result).toBeNull()
    })

    test('returns null for null', () => {
      const result = calculateAge(null)

      expect(result).toBeNull()
    })

    test('returns null for empty string', () => {
      const result = calculateAge('')

      expect(result).toBeNull()
    })

    test('returns null for invalid date string', () => {
      const result = calculateAge('not-a-date')

      expect(result).toBeNull()
    })

    test('returns null for impossible date', () => {
      const result = calculateAge('2025-13-45')

      expect(result).toBeNull()
    })
  })

  describe('age calculation', () => {
    test('calculates correct age for past date', () => {
      const result = calculateAge('2000-01-01')

      expect(result).toBe(26)
    })

    test('returns correct age when birthday already passed this year', () => {
      const result = calculateAge('2000-01-10')

      expect(result).toBe(26)
    })

    test('returns age minus one when birthday not yet this year', () => {
      const result = calculateAge('2000-12-31')

      expect(result).toBe(25)
    })

    test('returns correct age on exact birthday', () => {
      const result = calculateAge('2000-01-11')

      expect(result).toBe(26)
    })

    test('returns 0 for newborn born this year', () => {
      const result = calculateAge('2026-01-01')

      expect(result).toBe(0)
    })

    test('handles ISO format date string', () => {
      const result = calculateAge('1990-06-15T10:30:00Z')

      expect(result).toBe(35)
    })
  })
})
