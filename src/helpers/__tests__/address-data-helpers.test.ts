import {
  type AddressData,
  formatAddress,
  hasValidAddress,
  isValidAddressValue,
} from '@/helpers/address-data-helpers'
import { describe, expect, test } from 'vitest'

const enderecoCompleto: AddressData = {
  tipo_logradouro: 'Rua',
  logradouro: 'Visconde de Figueiredo',
  numero: '62',
  complemento: 'cob-01',
  bairro: 'Tijuca',
  municipio: 'Rio de Janeiro',
  estado: 'RJ',
  cep: '20550-100',
}

// O app gravava a string literal "null" em todos os campos ao "excluir" o
// endereço, e há cidadãos nesse estado em produção.
const enderecoExcluido: AddressData = {
  tipo_logradouro: 'null',
  logradouro: 'null',
  numero: 'null',
  complemento: 'null',
  bairro: 'null',
  municipio: 'null',
  estado: 'null',
  cep: 'null',
}

describe('isValidAddressValue', () => {
  test('aceita um valor preenchido', () => {
    expect(isValidAddressValue('Tijuca')).toBe(true)
  })

  test('recusa vazio, nulo e indefinido', () => {
    expect(isValidAddressValue('')).toBe(false)
    expect(isValidAddressValue('   ')).toBe(false)
    expect(isValidAddressValue(null)).toBe(false)
    expect(isValidAddressValue(undefined)).toBe(false)
  })

  test('recusa a string literal "null" em qualquer caixa', () => {
    expect(isValidAddressValue('null')).toBe(false)
    expect(isValidAddressValue('NULL')).toBe(false)
    expect(isValidAddressValue(' null ')).toBe(false)
  })

  test('não confunde uma palavra que começa com "null"', () => {
    expect(isValidAddressValue('Nullo')).toBe(true)
  })
})

describe('hasValidAddress', () => {
  test('aceita endereço com logradouro, bairro e município', () => {
    expect(hasValidAddress(enderecoCompleto)).toBe(true)
  })

  test('recusa endereço ausente', () => {
    expect(hasValidAddress(null)).toBe(false)
    expect(hasValidAddress(undefined)).toBe(false)
  })

  test('recusa o endereço zerado pela antiga exclusão', () => {
    expect(hasValidAddress(enderecoExcluido)).toBe(false)
  })

  test.each(['logradouro', 'bairro', 'municipio'] as const)(
    'recusa quando falta %s',
    campo => {
      expect(hasValidAddress({ ...enderecoCompleto, [campo]: '' })).toBe(false)
    }
  )

  test('não exige número, complemento nem CEP', () => {
    expect(
      hasValidAddress({
        logradouro: 'Visconde de Figueiredo',
        bairro: 'Tijuca',
        municipio: 'Rio de Janeiro',
      })
    ).toBe(true)
  })
})

describe('formatAddress', () => {
  test('junta as partes preenchidas', () => {
    expect(formatAddress(enderecoCompleto)).toBe(
      'Visconde de Figueiredo, 62, Tijuca, Rio de Janeiro, RJ'
    )
  })

  test('ignora as partes ausentes', () => {
    expect(
      formatAddress({
        logradouro: 'Visconde de Figueiredo',
        bairro: 'Tijuca',
        municipio: 'Rio de Janeiro',
      })
    ).toBe('Visconde de Figueiredo, Tijuca, Rio de Janeiro')
  })

  test('ignora as partes gravadas como "null"', () => {
    expect(
      formatAddress({
        ...enderecoExcluido,
        logradouro: 'Visconde de Figueiredo',
      })
    ).toBe('Visconde de Figueiredo')
  })

  test('usa o fallback quando não há nada aproveitável', () => {
    expect(formatAddress(enderecoExcluido)).toBe('Endereço não cadastrado')
    expect(formatAddress(null)).toBe('Endereço não cadastrado')
  })

  test('aceita um fallback próprio', () => {
    expect(formatAddress(null, 'Informe seu endereço')).toBe(
      'Informe seu endereço'
    )
  })
})
