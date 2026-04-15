/**
 * Utility functions for converting experience duration between
 * total months and years+months format.
 *
 * Used in curriculum experience form to provide better UX
 * while maintaining API compatibility (backend uses total months).
 */

export interface YearsAndMonths {
  anos: number
  meses: number
}

/**
 * Converts total months to years and remaining months.
 *
 * @param totalMonths - Total duration in months
 * @returns Object with anos (years) and meses (months), or null if input is invalid
 *
 * @example
 * convertMonthsToYearsAndMonths(30) // { anos: 2, meses: 6 }
 * convertMonthsToYearsAndMonths(12) // { anos: 1, meses: 0 }
 * convertMonthsToYearsAndMonths(5)  // { anos: 0, meses: 5 }
 * convertMonthsToYearsAndMonths(null) // null
 */
export function convertMonthsToYearsAndMonths(
  totalMonths: number | undefined | null
): YearsAndMonths | null {
  // Handle invalid inputs
  if (totalMonths == null || Number.isNaN(totalMonths) || totalMonths < 0) {
    return null
  }

  const months = Math.floor(totalMonths)
  const anos = Math.floor(months / 12)
  const meses = months % 12

  return { anos, meses }
}

/**
 * Converts years and months to total months.
 *
 * @param anos - Number of years
 * @param meses - Number of months (0-11)
 * @returns Total duration in months, or undefined if both inputs are empty/zero
 *
 * @example
 * convertYearsAndMonthsToMonths(2, 6)  // 30
 * convertYearsAndMonthsToMonths(1, 0)  // 12
 * convertYearsAndMonthsToMonths(0, 5)  // 5
 * convertYearsAndMonthsToMonths(0, 0)  // undefined
 * convertYearsAndMonthsToMonths(null, null)  // undefined
 */
export function convertYearsAndMonthsToMonths(
  anos: number | undefined | null,
  meses: number | undefined | null
): number | undefined {
  // Normalize inputs - treat null/undefined/NaN as 0
  const validAnos =
    Number.isNaN(anos) || anos == null ? 0 : Math.max(0, Math.floor(anos))
  const validMeses =
    Number.isNaN(meses) || meses == null ? 0 : Math.max(0, Math.floor(meses))

  const totalMonths = validAnos * 12 + validMeses

  // Return undefined if total is 0 (both fields empty)
  return totalMonths === 0 ? undefined : totalMonths
}
