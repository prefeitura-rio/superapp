/**
 * Color palettes for category service cards
 * Each palette contains 4 colors for the first 4 cards
 */

export type ColorPalette = [string, string, string, string]

export const COLOR_PALETTES: Record<number, ColorPalette> = {
  1: ['#1F2853', '#2C3562', '#424979', '#878BC1'], // roxo
  2: ['#0F2743', '#13335A', '#3E5782', '#677EAB'], // azul escuro
  3: ['#30000A', '#340011', '#57202E', '#804552'], //vinho
  4: ['#754D00', '#976A00', '#BA8800', '#C99519'], // amarelo
  5: ['#003C3B', '#005857', '#317978', '#569C9A'], // verde
  6: ['#7C2B1E', '#9C4737', '#BE6552', '#E2836F'], // salmon
  7: ['#004B72', '#005E86', '#5D9EC9', '#81BFED'], // azul claro
}

/**
 * Normalizes category name for consistent lookup
 * (same logic as in lib/categories.ts)
 */
function normalizeCategoryName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .trim()
}

/**
 * Mapping of normalized category names to color palette numbers
 */
const CATEGORY_PALETTE_MAP: Record<string, number> = {
  cidade: 5,
  educacao: 7,
  animais: 5,
  cidadania: 6,
  cultura: 4,
  cursos: 7,
  'defesa civil': 3,
  licencas: 6,
  'meio ambiente': 5,
  obras: 1,
  'ordem publica': 3,
  ouvidoria: 1,
  saude: 6,
  seguranca: 4,
  servidor: 1,
  tributos: 3,
  trabalho: 2,
  transporte: 2,
  transito: 4,
  'lei de acesso a informacao (lai)': 2,
  'lei geral de protecao de dados (lgpd)': 2,
  taxas: 4,
  'central anticorrupcao': 6,
  peticionamentos: 7,
}

/**
 * Default palette to use when category is not mapped
 */
const DEFAULT_PALETTE = 1

/**
 * Gets the color for a specific card position (0-3) based on category name
 * @param categoryName - The category name (will be normalized)
 * @param position - The card position (0-3, where 0 is the first card)
 * @returns The hex color for the card
 */
export function getCardColorForCategory(
  categoryName: string,
  position: number
): string {
  const normalized = normalizeCategoryName(categoryName)
  const paletteNumber = CATEGORY_PALETTE_MAP[normalized] || DEFAULT_PALETTE
  const palette = COLOR_PALETTES[paletteNumber]

  if (!palette) {
    // Fallback to default palette if invalid palette number
    return COLOR_PALETTES[DEFAULT_PALETTE][0]
  }

  // Clamp position to valid range (0-3)
  const clampedPosition = Math.max(0, Math.min(3, position))
  return palette[clampedPosition]
}

/**
 * Gets the entire color palette for a category
 * @param categoryName - The category name (will be normalized)
 * @returns The color palette array
 */
export function getPaletteForCategory(categoryName: string): ColorPalette {
  const normalized = normalizeCategoryName(categoryName)
  const paletteNumber = CATEGORY_PALETTE_MAP[normalized] || DEFAULT_PALETTE
  return COLOR_PALETTES[paletteNumber] || COLOR_PALETTES[DEFAULT_PALETTE]
}
