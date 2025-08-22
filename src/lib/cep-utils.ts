import type { ViaCepResponse } from '@/types/address'

export function isNumberInRange(
  complemento: string,
  userNumber: string | null
): boolean {
  if (!userNumber || !complemento) return true

  const num = Number.parseInt(userNumber)
  if (Number.isNaN(num)) return true

  // Handle "lado par" or "lado ímpar" - these are not numeric ranges
  if (
    complemento.toLowerCase().includes('lado par') ||
    complemento.toLowerCase().includes('lado ímpar')
  ) {
    return false
  }

  // Handle specific number format (e.g., "40")
  if (/^\d+$/.test(complemento.trim())) {
    return num === Number.parseInt(complemento.trim())
  }

  // Handle "até X/Y" format
  const ateMatch = complemento.match(/até\s+(\d+)(?:\/(\d+))?/)
  if (ateMatch) {
    const maxNum = Math.max(
      Number.parseInt(ateMatch[1]),
      ateMatch[2] ? Number.parseInt(ateMatch[2]) : 0
    )
    return num <= maxNum
  }

  // Handle "de X/Y ao fim" format
  const deAoFimMatch = complemento.match(/de\s+(\d+)(?:\/(\d+))?\s+ao\s+fim/i)
  if (deAoFimMatch) {
    const minNum = Math.min(
      Number.parseInt(deAoFimMatch[1]),
      deAoFimMatch[2]
        ? Number.parseInt(deAoFimMatch[2])
        : Number.POSITIVE_INFINITY
    )
    return num >= minNum
  }

  // Handle range format "X a Y" or "X-Y"
  const rangeMatch = complemento.match(/(\d+)\s*(?:a|-)\s*(\d+)/)
  if (rangeMatch) {
    const start = Number.parseInt(rangeMatch[1])
    const end = Number.parseInt(rangeMatch[2])
    return num >= start && num <= end
  }

  return true
}

export function hasOnlyNonNumericComplements(data: ViaCepResponse[]): boolean {
  return (
    data.length > 1 &&
    data.every(item => {
      const comp = item.complemento.toLowerCase()
      return (
        comp === '' ||
        comp.includes('lado par') ||
        comp.includes('lado ímpar') ||
        comp.includes('fundos') ||
        comp.includes('frente') ||
        comp.includes('bloco') ||
        comp.includes('lote') ||
        (!comp.match(/\d+/) && comp !== '')
      )
    })
  )
}

export function findBestCepMatch(
  data: ViaCepResponse[],
  numero?: string
): ViaCepResponse {
  // Check if all results have non-numeric complements
  if (hasOnlyNonNumericComplements(data)) {
    return data[0]
  }

  let bestMatch: ViaCepResponse | null = null

  if (numero) {
    // First, try to find exact number match
    const exactNumberMatch = data.find(
      item => item.complemento.trim() === numero
    )
    if (exactNumberMatch) {
      bestMatch = exactNumberMatch
    } else {
      // Find matches where the number is in range
      const rangeMatches = data.filter(item =>
        isNumberInRange(item.complemento, numero)
      )

      if (rangeMatches.length > 0) {
        // Prefer entries with specific ranges over empty complements
        bestMatch =
          rangeMatches.find(item => item.complemento !== '') || rangeMatches[0]
      }
    }
  }

  // If no match found with number, or no number provided,
  // prefer entries without complement (general CEP for the street)
  if (!bestMatch) {
    bestMatch = data.find(item => item.complemento === '') || data[0]
  }

  return bestMatch
}
