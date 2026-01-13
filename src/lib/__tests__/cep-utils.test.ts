import { describe, expect, test } from 'vitest'
import type { ViaCepResponse } from '@/types/address'
import {
  findBestCepMatch,
  hasOnlyNonNumericComplements,
  isNumberInRange,
} from '@/lib/cep-utils'

function createViaCepResponse(
  complemento: string,
  overrides: Partial<ViaCepResponse> = {}
): ViaCepResponse {
  return {
    cep: '20040-020',
    logradouro: 'Rua da Assembleia',
    complemento,
    unidade: '',
    bairro: 'Centro',
    localidade: 'Rio de Janeiro',
    uf: 'RJ',
    estado: 'Rio de Janeiro',
    regiao: 'Sudeste',
    ibge: '3304557',
    gia: '',
    ddd: '21',
    siafi: '6001',
    ...overrides,
  }
}

describe('isNumberInRange', () => {
  describe('special cases', () => {
    test('returns true for null userNumber', () => {
      const result = isNumberInRange('até 100', null)

      expect(result).toBe(true)
    })

    test('returns true for empty complemento', () => {
      const result = isNumberInRange('', '50')

      expect(result).toBe(true)
    })

    test('returns true for non-numeric userNumber', () => {
      const result = isNumberInRange('até 100', 'abc')

      expect(result).toBe(true)
    })

    test('returns false for "lado par"', () => {
      const result = isNumberInRange('lado par', '50')

      expect(result).toBe(false)
    })

    test('returns false for "lado ímpar"', () => {
      const result = isNumberInRange('lado ímpar', '50')

      expect(result).toBe(false)
    })
  })

  describe('exact match', () => {
    test('returns true when userNumber equals complemento', () => {
      const result = isNumberInRange('40', '40')

      expect(result).toBe(true)
    })

    test('returns false when userNumber differs from complemento', () => {
      const result = isNumberInRange('40', '41')

      expect(result).toBe(false)
    })
  })

  describe('range patterns', () => {
    test('returns true when userNumber is within "até X" range', () => {
      const result = isNumberInRange('até 100', '50')

      expect(result).toBe(true)
    })

    test('returns false when userNumber exceeds "até X" range', () => {
      const result = isNumberInRange('até 100', '101')

      expect(result).toBe(false)
    })

    test('returns true when userNumber equals "até X" limit', () => {
      const result = isNumberInRange('até 100', '100')

      expect(result).toBe(true)
    })

    test('handles "até X/Y" format with max of both', () => {
      const result = isNumberInRange('até 100/200', '150')

      expect(result).toBe(true)
    })

    test('returns true when userNumber is within "X a Y" range', () => {
      const result = isNumberInRange('10 a 20', '15')

      expect(result).toBe(true)
    })

    test('returns false when userNumber is outside "X a Y" range', () => {
      const result = isNumberInRange('10 a 20', '25')

      expect(result).toBe(false)
    })

    test('returns true when userNumber is within "X-Y" range', () => {
      const result = isNumberInRange('10-20', '15')

      expect(result).toBe(true)
    })

    test('returns true when userNumber matches "de X ao fim"', () => {
      const result = isNumberInRange('de 50 ao fim', '100')

      expect(result).toBe(true)
    })

    test('returns false when userNumber is below "de X ao fim"', () => {
      const result = isNumberInRange('de 50 ao fim', '30')

      expect(result).toBe(false)
    })
  })
})

describe('hasOnlyNonNumericComplements', () => {
  test('returns false for empty array', () => {
    const result = hasOnlyNonNumericComplements([])

    expect(result).toBe(false)
  })

  test('returns false for single item', () => {
    const data = [createViaCepResponse('lado par')]

    const result = hasOnlyNonNumericComplements(data)

    expect(result).toBe(false)
  })

  test('returns true when all items have non-numeric complements', () => {
    const data = [
      createViaCepResponse('lado par'),
      createViaCepResponse('lado ímpar'),
    ]

    const result = hasOnlyNonNumericComplements(data)

    expect(result).toBe(true)
  })

  test('returns true for empty complements', () => {
    const data = [createViaCepResponse(''), createViaCepResponse('')]

    const result = hasOnlyNonNumericComplements(data)

    expect(result).toBe(true)
  })

  test('returns true for mixed non-numeric complements', () => {
    const data = [
      createViaCepResponse('fundos'),
      createViaCepResponse('frente'),
      createViaCepResponse('bloco'),
    ]

    const result = hasOnlyNonNumericComplements(data)

    expect(result).toBe(true)
  })

  test('returns false when any item has numeric complement', () => {
    const data = [
      createViaCepResponse('lado par'),
      createViaCepResponse('até 100'),
    ]

    const result = hasOnlyNonNumericComplements(data)

    expect(result).toBe(false)
  })
})

describe('findBestCepMatch', () => {
  test('returns first item when all complements are non-numeric', () => {
    const data = [
      createViaCepResponse('lado par', { cep: '20040-020' }),
      createViaCepResponse('lado ímpar', { cep: '20040-021' }),
    ]

    const result = findBestCepMatch(data, '50')

    expect(result.cep).toBe('20040-020')
  })

  test('returns exact match when found', () => {
    const data = [
      createViaCepResponse('', { cep: '20040-020' }),
      createViaCepResponse('100', { cep: '20040-021' }),
      createViaCepResponse('200', { cep: '20040-022' }),
    ]

    const result = findBestCepMatch(data, '100')

    expect(result.cep).toBe('20040-021')
  })

  test('returns range match when number fits', () => {
    const data = [
      createViaCepResponse('', { cep: '20040-020' }),
      createViaCepResponse('até 100', { cep: '20040-021' }),
      createViaCepResponse('de 101 ao fim', { cep: '20040-022' }),
    ]

    const result = findBestCepMatch(data, '50')

    expect(result.cep).toBe('20040-021')
  })

  test('prefers non-empty complement over empty when in range', () => {
    const data = [
      createViaCepResponse('', { cep: '20040-020' }),
      createViaCepResponse('até 200', { cep: '20040-021' }),
    ]

    const result = findBestCepMatch(data, '50')

    expect(result.cep).toBe('20040-021')
  })

  test('returns empty complement match when no numero provided', () => {
    const data = [
      createViaCepResponse('até 100', { cep: '20040-020' }),
      createViaCepResponse('', { cep: '20040-021' }),
    ]

    const result = findBestCepMatch(data)

    expect(result.cep).toBe('20040-021')
  })

  test('returns first item when no empty complement and no numero', () => {
    const data = [
      createViaCepResponse('até 100', { cep: '20040-020' }),
      createViaCepResponse('de 101 ao fim', { cep: '20040-021' }),
    ]

    const result = findBestCepMatch(data)

    expect(result.cep).toBe('20040-020')
  })
})
