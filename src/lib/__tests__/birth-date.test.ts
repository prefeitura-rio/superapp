import { describe, expect, test } from 'vitest'

import {
  birthDateFormSchema,
  formatBirthDatePtBr,
  getAgeFromDateInput,
  isBirthDateEditable,
  minBirthDateInputValue,
  parseLocalDateInput,
  toDateInputValue,
  todayDateInputValue,
} from '@/lib/birth-date'

describe('birth-date helpers', () => {
  test('isBirthDateEditable é true quando data está ausente', () => {
    expect(isBirthDateEditable(undefined)).toBe(true)
    expect(isBirthDateEditable({})).toBe(true)
    expect(isBirthDateEditable({ origem: 'bcadastro' })).toBe(true)
  })

  test('isBirthDateEditable é true para origem self-declared', () => {
    expect(
      isBirthDateEditable({ data: '1995-08-25', origem: 'self-declared' })
    ).toBe(true)
  })

  test('isBirthDateEditable é false para data oficial', () => {
    expect(
      isBirthDateEditable({ data: '1995-08-25', origem: 'bcadastro' })
    ).toBe(false)
    expect(isBirthDateEditable({ data: '1995-08-25' })).toBe(false)
  })

  test('toDateInputValue normaliza ISO para YYYY-MM-DD', () => {
    expect(toDateInputValue('1995-08-25T00:00:00Z')).toBe('1995-08-25')
    expect(toDateInputValue('1995-08-25')).toBe('1995-08-25')
    expect(toDateInputValue(undefined)).toBe('')
  })

  test('formatBirthDatePtBr formata para pt-BR', () => {
    expect(formatBirthDatePtBr('1995-08-25')).toMatch(/25\/08\/1995/)
  })

  test('parseLocalDateInput rejeita data inválida de calendário', () => {
    expect(parseLocalDateInput('2024-02-31')).toBeNull()
    expect(parseLocalDateInput('1995-08-25')).toEqual(new Date(1995, 7, 25))
  })

  test('minBirthDateInputValue permite exatamente 120 anos', () => {
    const reference = new Date(2026, 8, 17)
    expect(minBirthDateInputValue(reference)).toBe('1905-09-18')
    expect(getAgeFromDateInput('1905-09-18', reference)).toBe(120)
    expect(getAgeFromDateInput('1905-09-17', reference)).toBe(121)
  })

  test('todayDateInputValue usa fuso local', () => {
    const reference = new Date(2026, 8, 17)
    expect(todayDateInputValue(reference)).toBe('2026-09-17')
  })
})

describe('birthDateFormSchema', () => {
  const referenceToday = '1990-01-01'

  test('aceita data válida dentro do limite de idade', () => {
    const result = birthDateFormSchema.safeParse({ birthDate: referenceToday })
    expect(result.success).toBe(true)
  })

  test('rejeita campo vazio', () => {
    const result = birthDateFormSchema.safeParse({ birthDate: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'Informe a data de nascimento'
      )
    }
  })

  test('rejeita data no futuro', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const y = tomorrow.getFullYear()
    const m = String(tomorrow.getMonth() + 1).padStart(2, '0')
    const d = String(tomorrow.getDate()).padStart(2, '0')

    const result = birthDateFormSchema.safeParse({
      birthDate: `${y}-${m}-${d}`,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'Data de nascimento não pode ser no futuro'
      )
    }
  })

  test('rejeita idade acima de 120 anos', () => {
    const tooOld = minBirthDateInputValue()
    const [y, m, d] = tooOld.split('-').map(Number)
    const older = new Date(y, m - 1, d)
    older.setDate(older.getDate() - 1)
    const olderValue = `${older.getFullYear()}-${String(older.getMonth() + 1).padStart(2, '0')}-${String(older.getDate()).padStart(2, '0')}`

    const result = birthDateFormSchema.safeParse({ birthDate: olderValue })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Idade inválida')
    }
  })
})
