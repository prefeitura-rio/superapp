/**
 * Utilities for detecting and filtering duplicate language selections.
 */

import type { IdiomaItem } from '../curriculo-formacao-schema'

/**
 * Extracts all selected language IDs from the idiomas array,
 * excluding the current field index.
 *
 * This is useful for checking which languages are already selected
 * when opening the language selection drawer, allowing the current
 * field to re-select the same language (for editing purposes).
 *
 * @param idiomas - Array of language items from form
 * @param currentIndex - Index to exclude (the field being edited)
 * @returns Set of selected language IDs
 *
 * @example
 * const idiomas = [
 *   { idIdioma: 'en', idNivel: 'basic' },
 *   { idIdioma: 'es', idNivel: 'advanced' },
 *   { idIdioma: '', idNivel: '' }, // empty, ignored
 * ]
 * getSelectedLanguageIds(idiomas, 1) // Returns Set(['en'])
 * // 'es' excluded because currentIndex=1, empty item ignored
 */
export function getSelectedLanguageIds(
  idiomas: IdiomaItem[],
  currentIndex: number
): Set<string> {
  const selectedIds = new Set<string>()

  idiomas.forEach((item, index) => {
    if (index !== currentIndex && item.idIdioma?.trim()) {
      selectedIds.add(item.idIdioma.trim())
    }
  })

  return selectedIds
}

/**
 * Finds duplicate language IDs in the idiomas array.
 * Returns a Set of IDs that appear more than once.
 *
 * Empty or undefined IDs are ignored.
 *
 * @param idiomas - Array of language items from form
 * @returns Set of duplicate language IDs
 *
 * @example
 * const idiomas = [
 *   { idIdioma: 'en', idNivel: 'basic' },
 *   { idIdioma: 'en', idNivel: 'advanced' }, // duplicate!
 *   { idIdioma: 'es', idNivel: 'basic' },
 * ]
 * findDuplicateLanguageIds(idiomas) // Returns Set(['en'])
 */
export function findDuplicateLanguageIds(idiomas: IdiomaItem[]): Set<string> {
  const seen = new Map<string, number>()
  const duplicates = new Set<string>()

  idiomas.forEach(item => {
    const id = item.idIdioma?.trim()
    if (!id) return

    const count = seen.get(id) || 0
    seen.set(id, count + 1)

    if (count >= 1) {
      duplicates.add(id)
    }
  })

  return duplicates
}

/**
 * Checks if a specific language ID is already selected,
 * excluding a specific index.
 *
 * Useful for inline validation or checking before allowing selection.
 *
 * @param idiomas - Array of language items
 * @param languageId - Language ID to check
 * @param excludeIndex - Index to exclude from check
 * @returns true if language is already selected elsewhere
 *
 * @example
 * const idiomas = [
 *   { idIdioma: 'en', idNivel: 'basic' },
 *   { idIdioma: 'es', idNivel: 'advanced' },
 * ]
 * isLanguageAlreadySelected(idiomas, 'en', 1) // true (exists at index 0)
 * isLanguageAlreadySelected(idiomas, 'en', 0) // false (excluded)
 * isLanguageAlreadySelected(idiomas, 'fr', 0) // false (not found)
 */
export function isLanguageAlreadySelected(
  idiomas: IdiomaItem[],
  languageId: string,
  excludeIndex: number
): boolean {
  return idiomas.some(
    (item, index) =>
      index !== excludeIndex && item.idIdioma?.trim() === languageId.trim()
  )
}
