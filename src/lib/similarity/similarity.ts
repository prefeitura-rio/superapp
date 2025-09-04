export type BonusRule = (input: string, target: string) => number

export function calculateSimilarity(
  input: string,
  target: string,
  bonusRules: BonusRule[] = []
) {
  // Skip if strings are too different in length
  if (Math.abs(input.length - target.length) > 3) return 0

  const distance = levenshteinDistance(input, target)
  const maxLength = Math.max(input.length, target.length)
  let similarity = 1 - distance / maxLength

  // Apply all injected bonus rules
  for (const rule of bonusRules) {
    similarity += rule(input, target)
  }

  return Math.min(1, similarity)
}

export function levenshteinDistance(str1: string, str2: string) {
  const matrix = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  // Compute edit distances
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        // No operation needed
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        // Minimum of replace, insert, or delete
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  // Final edit distance
  return matrix[str2.length][str1.length]
}
