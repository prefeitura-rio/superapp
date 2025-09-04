import { type BonusRule, calculateSimilarity } from './similarity'

// Common real-world misspellings mapped to their intended domains
const commonMisspellings: Record<string, string> = {
  'gnail.com': 'gmail.com',
  'hotmial.com': 'hotmail.com',
  'yhoo.com': 'yahoo.com',
  'outlok.com': 'outlook.com',
  'outlooks.com': 'outlook.com',
  'yahooo.com': 'yahoo.com',
  'gmai.com': 'gmail.com',
}

const emailBonusRules: BonusRule[] = [
  // Slight length difference often means a missing/extra character
  (input, target) => (Math.abs(input.length - target.length) === 1 ? 0.1 : 0),

  // Known misspellings give a stronger confidence boost
  (input, target) => {
    return commonMisspellings[input] === target ? 0.2 : 0
  },
]

type SuggestionResult = {
  confidence: number
  suggestedDomain: string
  suggestedEmail: string
}

export function suggestEmailDomain(email: string): SuggestionResult | null {
  // Supported domains
  const popularDomains = [
    'gmail.com',
    'hotmail.com',
    'yahoo.com',
    'outlook.com',
    'live.com',
    'icloud.com',
  ]

  const emailParts = email.split('@')
  if (emailParts.length !== 2) {
    return null
  }

  const inputDomain = emailParts[1].toLowerCase().trim()

  if (popularDomains.includes(inputDomain)) {
    return null
  }

  let bestMatch = null
  let bestScore = 0

  for (const targetDomain of popularDomains) {
    const score = calculateSimilarity(
      inputDomain,
      targetDomain,
      emailBonusRules
    )

    // Only accept if better than current and passes minimum 60% confidence
    if (score > bestScore && score >= 0.6) {
      bestScore = score
      bestMatch = targetDomain
    }
  }

  if (bestMatch) {
    return {
      confidence: Math.round(bestScore * 100),
      suggestedDomain: bestMatch,
      // biome-ignore lint/style/useTemplate: <explanation>
      suggestedEmail: emailParts[0] + '@' + bestMatch,
    }
  }

  return null
}
