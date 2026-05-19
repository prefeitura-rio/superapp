/**
 * Utilities for sorting language proficiency levels in canonical order.
 */

/**
 * Defines the canonical order for language proficiency levels.
 * Lower index = lower proficiency.
 */
export const LANGUAGE_LEVEL_ORDER: Record<string, number> = {
  Básico: 1,
  Intermediário: 2,
  Avançado: 3,
  'Nativo/Fluente': 4,
  Fluente: 4, // Alias handling
}

/**
 * Gets the priority value for a language level.
 * Uses the LANGUAGE_LEVEL_ORDER map, with fallback to numeric ID parsing.
 *
 * @param descricao - The level description (e.g., "Básico", "Intermediário")
 * @param id - The level ID from the database
 * @returns Priority number (lower = lower proficiency)
 */
function getLevelPriority(descricao: string, id: string): number {
  const priority = LANGUAGE_LEVEL_ORDER[descricao]
  if (priority !== undefined) return priority

  // Fallback: try to parse ID as number
  const numericId = Number.parseInt(id, 10)
  if (!Number.isNaN(numericId)) return numericId + 1000 // Offset to keep after known levels

  // Last resort: use a high number (will sort to end)
  return 9999
}

/**
 * Sorts language levels by proficiency in ascending order (Básico → Nativo/Fluente).
 * Works with any object containing { id: string, descricao: string }.
 *
 * @example
 * const levels = [
 *   { id: '3', descricao: 'Avançado' },
 *   { id: '1', descricao: 'Básico' },
 *   { id: '2', descricao: 'Intermediário' },
 *   { id: '4', descricao: 'Nativo/Fluente' },
 * ]
 * const sorted = sortLanguageLevels(levels)
 * // Returns: [Básico, Intermediário, Avançado, Nativo/Fluente]
 *
 * @param levels - Array of level objects with id and descricao
 * @returns New sorted array (does not mutate input)
 */
export function sortLanguageLevels<T extends { id: string; descricao: string }>(
  levels: T[]
): T[] {
  return [...levels].sort((a, b) => {
    const priorityA = getLevelPriority(a.descricao, a.id)
    const priorityB = getLevelPriority(b.descricao, b.id)
    return priorityA - priorityB
  })
}
