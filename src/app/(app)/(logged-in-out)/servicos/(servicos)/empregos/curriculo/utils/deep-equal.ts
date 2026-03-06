/**
 * Normalizes empty values for comparison.
 * Treats undefined, null, and empty/whitespace-only strings as equivalent.
 */
function normalizeValue(value: unknown): unknown {
  if (value === undefined || value === null) return ''
  if (typeof value === 'string') return value.trim()
  return value
}

/**
 * Deep equality comparison with normalization for form values.
 *
 * Features:
 * - Trims strings before comparison
 * - Treats undefined, null, and '' as equivalent
 * - Compares arrays element by element (different lengths = not equal)
 * - Recursively compares nested objects
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  const normalizedA = normalizeValue(a)
  const normalizedB = normalizeValue(b)

  // Both are empty after normalization
  if (normalizedA === '' && normalizedB === '') return true

  // Different types after normalization
  if (typeof normalizedA !== typeof normalizedB) return false

  // Primitives (string, number, boolean)
  if (typeof normalizedA !== 'object' || normalizedA === null) {
    return normalizedA === normalizedB
  }

  // Arrays
  if (Array.isArray(normalizedA) && Array.isArray(normalizedB)) {
    if (normalizedA.length !== normalizedB.length) return false
    return normalizedA.every((item, index) => deepEqual(item, normalizedB[index]))
  }

  // One is array, other is not
  if (Array.isArray(normalizedA) !== Array.isArray(normalizedB)) return false

  // Objects
  const objA = normalizedA as Record<string, unknown>
  const objB = normalizedB as Record<string, unknown>
  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  // Get all unique keys from both objects
  const allKeys = new Set([...keysA, ...keysB])

  for (const key of allKeys) {
    if (!deepEqual(objA[key], objB[key])) return false
  }

  return true
}
