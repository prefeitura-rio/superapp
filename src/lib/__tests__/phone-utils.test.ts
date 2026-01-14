import { describe, expect, test } from 'vitest'
import {
  formatPhoneNumber,
  getPhonePlaceholder,
  isValidPhone,
  parsePhoneNumberForApi,
} from '@/lib/phone-utils'

describe('formatPhoneNumber', () => {
  test('returns empty string for empty input', () => {
    const result = formatPhoneNumber('', 'BR')

    expect(result).toBe('')
  })

  test('formats Brazilian mobile number correctly', () => {
    const result = formatPhoneNumber('21987654321', 'BR')

    expect(result).toBe('(21) 98765-4321')
  })

  test('formats partial Brazilian number as typed', () => {
    const result = formatPhoneNumber('21987', 'BR')

    expect(result).toBe('(21) 987')
  })

  test('formats US number correctly', () => {
    const result = formatPhoneNumber('2025551234', 'US')

    expect(result).toBe('(202) 555-1234')
  })
})

describe('isValidPhone', () => {
  test('returns true for valid Brazilian mobile', () => {
    const result = isValidPhone('21987654321', 'BR')

    expect(result).toBe(true)
  })

  test('returns true for formatted Brazilian mobile', () => {
    const result = isValidPhone('(21) 98765-4321', 'BR')

    expect(result).toBe(true)
  })

  test('returns false for invalid phone number', () => {
    const result = isValidPhone('123', 'BR')

    expect(result).toBe(false)
  })

  test('returns false for empty string', () => {
    const result = isValidPhone('', 'BR')

    expect(result).toBe(false)
  })

  test('returns false for phone with wrong country', () => {
    const result = isValidPhone('21987654321', 'US')

    expect(result).toBe(false)
  })
})

describe('parsePhoneNumberForApi', () => {
  test('parses Brazilian phone into ddi, ddd, and valor', () => {
    const result = parsePhoneNumberForApi('21987654321', 'BR')

    expect(result).toEqual({
      ddi: '55',
      ddd: '21',
      valor: '987654321',
    })
  })

  test('parses formatted Brazilian phone correctly', () => {
    const result = parsePhoneNumberForApi('(11) 99876-5432', 'BR')

    expect(result).toEqual({
      ddi: '55',
      ddd: '11',
      valor: '998765432',
    })
  })

  test('returns object with short number for incomplete phone', () => {
    const result = parsePhoneNumberForApi('123', 'BR')

    expect(result).toEqual({
      ddi: '55',
      ddd: '',
      valor: '123',
    })
  })

  test('returns null for empty string', () => {
    const result = parsePhoneNumberForApi('', 'BR')

    expect(result).toBeNull()
  })

  test('parses US phone without ddd', () => {
    const result = parsePhoneNumberForApi('2025551234', 'US')

    expect(result).toEqual({
      ddi: '1',
      ddd: '',
      valor: '2025551234',
    })
  })
})

describe('getPhonePlaceholder', () => {
  test('returns Brazilian placeholder for BR country', () => {
    const result = getPhonePlaceholder('BR')

    expect(result).toBe('(21) 98765-4321')
  })

  test('returns formatted placeholder for US country', () => {
    const result = getPhonePlaceholder('US')

    expect(result).toMatch(/\(\d{3}\) \d{3}-\d{4}/)
  })
})
