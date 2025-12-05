/**
 * Formats a complete address string from address components
 * Format: "Rua Mora, 303, Campo Grande, Rio de Janeiro, RJ"
 * @param address - Address object with logradouro, numero, bairro, municipio, estado
 * @returns Formatted address string
 */
export function formatAddressComplete(
  address:
    | {
        logradouro?: string
        numero?: string
        bairro?: string
        municipio?: string
        estado?: string
        tipo_logradouro?: string
        complemento?: string
        cep?: string
      }
    | null
    | undefined
): string {
  if (!address) {
    return ''
  }

  const parts: string[] = []

  // Helper to check if a value is valid (not null, undefined, empty string, or "null" string)
  const isValidValue = (value: string | null | undefined): boolean => {
    if (!value || value === null || value === undefined) return false
    const trimmed = String(value).trim()
    return trimmed !== '' && trimmed.toLowerCase() !== 'null'
  }

  // Add tipo_logradouro and logradouro
  const logradouro = address.logradouro
  const tipoLogradouro = address.tipo_logradouro
  if (isValidValue(tipoLogradouro) && isValidValue(logradouro)) {
    parts.push(`${tipoLogradouro} ${logradouro}`.trim())
  } else if (isValidValue(logradouro)) {
    parts.push(String(logradouro).trim())
  }

  // Add numero
  if (isValidValue(address.numero)) {
    parts.push(String(address.numero).trim())
  }

  // Add bairro
  if (isValidValue(address.bairro)) {
    parts.push(String(address.bairro).trim())
  }

  // Add municipio
  if (isValidValue(address.municipio)) {
    parts.push(String(address.municipio).trim())
  }

  // Add estado
  if (isValidValue(address.estado)) {
    parts.push(String(address.estado).trim())
  }

  return parts.join(', ')
}

