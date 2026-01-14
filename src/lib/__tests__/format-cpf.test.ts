import { describe, expect, test } from 'vitest'
import { formatCpf } from '@/lib/format-cpf'

describe('formatCpf', () => {
  describe('invalid inputs', () => {
    test('returns empty string for undefined', () => {
      const result = formatCpf(undefined)

      expect(result).toBe('')
    })

    test('returns empty string for empty string', () => {
      const result = formatCpf('')

      expect(result).toBe('')
    })
  })

  describe('valid CPF', () => {
    test('formats 11 digits to XXX.XXX.XXX-XX pattern', () => {
      const result = formatCpf('12345678901')

      expect(result).toBe('123.456.789-01')
    })

    test('returns unformatted when less than 11 digits', () => {
      const result = formatCpf('1234567890')

      expect(result).toBe('1234567890')
    })

    test('formats CPF with leading zeros correctly', () => {
      const result = formatCpf('00123456789')

      expect(result).toBe('001.234.567-89')
    })
  })
})
