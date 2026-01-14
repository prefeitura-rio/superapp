import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  formatDate,
  formatTimeRange,
  formatTimestamp,
  isUpdatedWithin,
} from '@/lib/date'

describe('isUpdatedWithin', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-11'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('returns false for null updatedAt', () => {
    const result = isUpdatedWithin({ updatedAt: null, months: 6 })

    expect(result).toBe(false)
  })

  test('returns false for undefined updatedAt', () => {
    const result = isUpdatedWithin({ updatedAt: undefined, months: 6 })

    expect(result).toBe(false)
  })

  test('returns true when date is within specified months', () => {
    const result = isUpdatedWithin({ updatedAt: '2025-12-01', months: 6 })

    expect(result).toBe(true)
  })

  test('returns false when date is older than specified months', () => {
    const result = isUpdatedWithin({ updatedAt: '2025-01-01', months: 6 })

    expect(result).toBe(false)
  })

  test('returns true for date exactly at the limit', () => {
    const result = isUpdatedWithin({ updatedAt: '2025-07-11', months: 6 })

    expect(result).toBe(true)
  })
})

describe('formatTimeRange', () => {
  test('returns empty string for null', () => {
    const result = formatTimeRange(null)

    expect(result).toBe('')
  })

  test('returns empty string for empty string', () => {
    const result = formatTimeRange('')

    expect(result).toBe('')
  })

  test('formats time range with :00 correctly', () => {
    const result = formatTimeRange('09:00-17:00')

    expect(result).toBe('09h às 17h')
  })

  test('formats time range without :00 correctly', () => {
    const result = formatTimeRange('09:30-17:45')

    expect(result).toBe('09:30h às 17:45h')
  })

  test('returns original string when not a valid range format', () => {
    const result = formatTimeRange('09:00')

    expect(result).toBe('09:00')
  })

  test('handles range with spaces', () => {
    const result = formatTimeRange(' 08:00-16:00 ')

    expect(result).toBe('08h às 16h')
  })
})

describe('formatDate', () => {
  test('returns null for null input', () => {
    const result = formatDate(null)

    expect(result).toBeNull()
  })

  test('returns null for empty string', () => {
    const result = formatDate('')

    expect(result).toBeNull()
  })

  test('formats ISO date to Brazilian format', () => {
    const result = formatDate('2025-01-15T12:00:00')

    expect(result).toBe('15/01/2025')
  })

  test('formats ISO datetime to Brazilian format', () => {
    const result = formatDate('2025-12-25T10:30:00Z')

    expect(result).toMatch(/25\/12\/2025/)
  })
})

describe('formatTimestamp', () => {
  test('returns null for null input', () => {
    const result = formatTimestamp(null)

    expect(result).toBeNull()
  })

  test('returns null for zero timestamp', () => {
    const result = formatTimestamp(0)

    expect(result).toBeNull()
  })

  test('converts unix timestamp to Brazilian date format', () => {
    const timestamp = 1736600400
    const result = formatTimestamp(timestamp)

    expect(result).toBe('11/01/2025')
  })

  test('handles string timestamp', () => {
    const timestamp = '1736600400'
    const result = formatTimestamp(timestamp)

    expect(result).toBe('11/01/2025')
  })

  test('returns null for invalid string', () => {
    const result = formatTimestamp('not-a-number')

    expect(result).toBeNull()
  })

  test('handles small timestamp', () => {
    const result = formatTimestamp(86400 + 43200)

    expect(result).toBe('02/01/1970')
  })
})
