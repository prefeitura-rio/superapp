import { z } from 'zod'

const DATE_INPUT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
export const MAX_BIRTH_AGE_YEARS = 120

/**
 * Data de nascimento pode ser editada quando está ausente ou quando a origem
 * é autodeclaração. Dados oficiais (base municipal) não podem ser alterados.
 */
export function isBirthDateEditable(
  nascimento?: { data?: string; origem?: string } | null
): boolean {
  if (!nascimento?.data) return true
  return nascimento.origem === 'self-declared'
}

/** Normaliza string de data (YYYY-MM-DD ou ISO) para o value de <input type="date">. */
export function toDateInputValue(dateStr?: string | null): string {
  if (!dateStr) return ''
  return dateStr.slice(0, 10)
}

export function formatBirthDatePtBr(dateStr?: string | null): string {
  if (!dateStr) return ''
  const ymd = toDateInputValue(dateStr)
  const match = DATE_INPUT_PATTERN.exec(ymd)
  if (!match) {
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleDateString('pt-BR')
  }
  const [, year, month, day] = match
  return `${day}/${month}/${year}`
}

function formatLocalDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Interpreta YYYY-MM-DD no fuso local (evita off-by-one do parse UTC). */
export function parseLocalDateInput(dateStr: string): Date | null {
  const match = DATE_INPUT_PATTERN.exec(dateStr)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

export function todayDateInputValue(referenceDate = new Date()): string {
  return formatLocalDateInputValue(referenceDate)
}

/**
 * Data mínima aceita no input (idade máxima de 120 anos).
 * Equivale a (hoje − 121 anos + 1 dia), para incluir quem ainda tem 120 anos.
 */
export function minBirthDateInputValue(referenceDate = new Date()): string {
  const date = new Date(referenceDate)
  date.setFullYear(date.getFullYear() - (MAX_BIRTH_AGE_YEARS + 1))
  date.setDate(date.getDate() + 1)
  return formatLocalDateInputValue(date)
}

export function getAgeFromDateInput(
  dateStr: string,
  referenceDate = new Date()
): number | null {
  const birth = parseLocalDateInput(dateStr)
  if (!birth) return null

  const today = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  )

  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

export const birthDateFormSchema = z.object({
  birthDate: z
    .string()
    .min(1, 'Informe a data de nascimento')
    .regex(DATE_INPUT_PATTERN, 'Data inválida')
    .refine(val => parseLocalDateInput(val) !== null, {
      message: 'Data inválida',
    })
    .refine(
      val => {
        const age = getAgeFromDateInput(val)
        return age !== null && age >= 0
      },
      { message: 'Data de nascimento não pode ser no futuro' }
    )
    .refine(
      val => {
        const age = getAgeFromDateInput(val)
        return age !== null && age <= MAX_BIRTH_AGE_YEARS
      },
      { message: 'Idade inválida' }
    ),
})

export type BirthDateFormData = z.infer<typeof birthDateFormSchema>
