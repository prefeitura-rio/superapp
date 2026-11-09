import { calculateAge } from '@/lib/calculate-age'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

describe('calculateAge', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // 11/01/2026 ao meio-dia em Brasília (15h em UTC)
    vi.setSystemTime(new Date('2026-01-11T15:00:00Z'))
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

    test('returns null for day outside the calendar', () => {
      expect(calculateAge('2008-02-30')).toBeNull()
      expect(calculateAge('2007-02-29')).toBeNull()
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

    test('accepts leap-day birth date', () => {
      expect(calculateAge('2008-02-29')).toBe(17)
    })
  })
})

describe('calculateAge — dia civil de Brasília, em qualquer fuso do processo', () => {
  /** 15/06/2026 às 23h30 em Brasília: em UTC (e em Tóquio) já é 16/06. */
  const NOITE_EM_BRASILIA = new Date('2026-06-16T02:30:00Z')
  /** 16/06/2026 às 0h em Brasília: em Honolulu ainda é 15/06. */
  const MEIA_NOITE_EM_BRASILIA = new Date('2026-06-16T03:00:00Z')

  const FUSOS = [
    { fuso: 'UTC', diaLocalNaNoite: 16 },
    { fuso: 'America/Sao_Paulo', diaLocalNaNoite: 15 },
    { fuso: 'Asia/Tokyo', diaLocalNaNoite: 16 },
    { fuso: 'Pacific/Honolulu', diaLocalNaNoite: 15 },
  ] as const

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
  })

  describe.each(FUSOS)('processo em $fuso', ({ fuso, diaLocalNaNoite }) => {
    function noInstante(instante: Date) {
      vi.stubEnv('TZ', fuso)
      vi.useFakeTimers()
      vi.setSystemTime(instante)
    }

    test('o processo usa o fuso do cenário', () => {
      noInstante(NOITE_EM_BRASILIA)
      expect(new Date().getDate()).toBe(diaLocalNaNoite)
    })

    test('às 23h30 em Brasília, quem faz 18 anos amanhã ainda tem 17', () => {
      noInstante(NOITE_EM_BRASILIA)
      for (const nascimento of [
        '2008-06-16',
        '2008-06-16T00:00:00Z',
        '2008-06-16T00:00:00.000Z',
      ]) {
        expect(calculateAge(nascimento)).toBe(17)
      }
    })

    test('às 23h30 em Brasília, quem faz 18 anos hoje tem 18', () => {
      noInstante(NOITE_EM_BRASILIA)
      for (const nascimento of ['2008-06-15', '2008-06-15T00:00:00Z']) {
        expect(calculateAge(nascimento)).toBe(18)
      }
    })

    test('à meia-noite em Brasília, quem faz 18 anos nesse dia já tem 18', () => {
      noInstante(MEIA_NOITE_EM_BRASILIA)
      expect(calculateAge('2008-06-16')).toBe(18)
      expect(calculateAge('2008-06-17')).toBe(17)
    })

    test('data fora do calendário devolve null', () => {
      noInstante(NOITE_EM_BRASILIA)
      for (const nascimento of ['2008-02-30', '2008-13-01', '15/06/2008']) {
        expect(calculateAge(nascimento)).toBeNull()
      }
    })
  })
})
