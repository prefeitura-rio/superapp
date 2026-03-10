/**
 * Google Maps utilities for building URLs and validating addresses
 * Used to create clickable address links that open in Google Maps
 */

/**
 * Validates if an address string is valid and mappable
 * Filters out generic addresses that shouldn't be linked to Maps
 *
 * @param address - The address string to validate
 * @returns true if address is valid for mapping, false otherwise
 *
 * @example
 * ```typescript
 * isValidMappableAddress("Rua Mora, 303, Campo Grande, RJ") // true
 * isValidMappableAddress("Consulte o site") // false
 * isValidMappableAddress("") // false
 * ```
 */
export function isValidMappableAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false
  }

  const trimmed = address.trim()

  // Address must have minimum length to be valid
  if (trimmed.length < 10) {
    return false
  }

  // Blacklist of patterns that indicate non-mappable addresses
  const invalidPatterns = [
    /^consulte/i,
    /^veja/i,
    /^diversos/i,
    /^vários/i,
    /^várias/i,
    /^não definido/i,
    /^a definir/i,
    /^site/i,
    /^online/i,
    /^digital/i,
    /^telefone/i,
    /^contato/i,
  ]

  // Check if address matches any invalid pattern
  const isInvalid = invalidPatterns.some(pattern => pattern.test(trimmed))

  return !isInvalid
}

/**
 * Extrai a parte relevante do endereço para Google Maps
 * Remove informações de unidade, bairro e funcionamento
 *
 * Padrão esperado: "UNIDADE - BAIRRO - Rua X, 123 - Funcionamento: ..."
 * Retorna: "Rua X, 123"
 *
 * @param fullAddress - Endereço completo como vem do backend
 * @returns Endereço filtrado para o Maps
 *
 * @example
 * ```typescript
 * extractRelevantAddress("UNIDADE - CENTRO - Av. Presidente Vargas, 1997 - Funcionamento: ...")
 * // Returns: "Av. Presidente Vargas, 1997"
 *
 * extractRelevantAddress("Rua Mora, 303, Campo Grande, RJ")
 * // Returns: "Rua Mora, 303, Campo Grande, RJ" (sem parsing, já começa com tipo de logradouro)
 * ```
 */
export function extractRelevantAddress(fullAddress: string): string {
  if (!fullAddress || typeof fullAddress !== 'string') {
    return ''
  }

  const trimmed = fullAddress.trim()

  // Split por " - " (espaço-hífen-espaço)
  const parts = trimmed.split(' - ')

  // Regex para detectar tipos de logradouro no início da string
  const streetTypeRegex =
    /^(Rua|Avenida|Av\.|Av|R\.|Travessa|Tv\.|Alameda|Al\.|Praça|Pç\.|Estrada|Est\.|Rodovia|Rod\.)\s+/i

  // Procurar a parte que começa com tipo de logradouro
  let addressPart = ''

  for (const part of parts) {
    if (streetTypeRegex.test(part.trim())) {
      addressPart = part.trim()
      break
    }
  }

  // Se não encontrou tipo de logradouro, tentar heurística:
  // A parte do endereço geralmente é a 3ª parte em estruturas como:
  // "UNIDADE - BAIRRO - Endereço - Funcionamento"
  if (!addressPart && parts.length >= 3) {
    addressPart = parts[2].trim()
  }

  // Se ainda não encontrou, usar o endereço inteiro
  if (!addressPart) {
    addressPart = trimmed
  }

  // Remover parte de "Funcionamento" se existir
  const funcIndex = addressPart.toLowerCase().indexOf('funcionamento')
  if (funcIndex !== -1) {
    addressPart = addressPart.substring(0, funcIndex).trim()
    // Remover trailing " - " se houver
    if (addressPart.endsWith(' -')) {
      addressPart = addressPart.slice(0, -2).trim()
    }
  }

  return addressPart
}

/**
 * Builds a Google Maps search URL from an address string
 * Uses the official Google Maps URL API format
 *
 * @param address - Full address string to search for
 * @returns Encoded Google Maps URL, or empty string if address is invalid
 *
 * @example
 * ```typescript
 * buildGoogleMapsUrl("UNIDADE - CENTRO - Av. Presidente Vargas, 1997 - Funcionamento: ...")
 * // Returns: "https://www.google.com/maps/search/?api=1&query=Av.%20Presidente%20Vargas%2C%201997"
 *
 * buildGoogleMapsUrl("Consulte o site")
 * // Returns: ""
 * ```
 *
 * @see https://developers.google.com/maps/documentation/urls/get-started
 */
export function buildGoogleMapsUrl(address: string): string {
  if (!isValidMappableAddress(address)) {
    return ''
  }

  // Extrair parte relevante do endereço
  const relevantAddress = extractRelevantAddress(address)

  if (!relevantAddress || relevantAddress.length < 10) {
    return ''
  }

  // Google Maps Search API URL format
  // This works across desktop and mobile, and will open the Google Maps app if available
  const encodedAddress = encodeURIComponent(relevantAddress)
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
}
