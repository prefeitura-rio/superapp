import {
  formatarInscricaoImobiliaria,
  somenteDigitos,
} from '@/lib/divida-ativa-utils'
import { describe, expect, test } from 'vitest'

describe('somenteDigitos', () => {
  test('removes mask characters typed by the citizen', () => {
    expect(somenteDigitos('0.521.766-3')).toBe('05217663')
  })

  test('removes letters and spaces', () => {
    expect(somenteDigitos(' 052 abc 17663 ')).toBe('05217663')
  })

  test('returns an empty string when there is no digit', () => {
    expect(somenteDigitos('abc-.')).toBe('')
  })
})

describe('formatarInscricaoImobiliaria', () => {
  test('formats 8 digits as X.XXX.XXX-X', () => {
    expect(formatarInscricaoImobiliaria('05217663')).toBe('0.521.766-3')
  })

  test('formats 7 digits as XXX.XXX-X', () => {
    expect(formatarInscricaoImobiliaria('5217663')).toBe('521.766-3')
  })

  test('leaves fewer than 7 digits unmasked while the citizen is still typing', () => {
    // Abaixo de 7 dígitos não dá para saber onde cai o dígito verificador: mascarar ali
    // produziria estados intermediários sem sentido ("0-5") a cada tecla.
    expect(formatarInscricaoImobiliaria('0')).toBe('0')
    expect(formatarInscricaoImobiliaria('052')).toBe('052')
    expect(formatarInscricaoImobiliaria('052176')).toBe('052176')
  })

  test('re-masks an already masked value without duplicating separators', () => {
    expect(formatarInscricaoImobiliaria('0.521.766-3')).toBe('0.521.766-3')
  })

  test('discards non-digits and truncates above 8 digits', () => {
    expect(formatarInscricaoImobiliaria('05a21b7663999')).toBe('0.521.766-3')
  })

  test('returns an empty string for an empty value', () => {
    expect(formatarInscricaoImobiliaria('')).toBe('')
  })
})
