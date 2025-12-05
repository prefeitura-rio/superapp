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

  // Add tipo_logradouro and logradouro
  const logradouro = address.logradouro || ''
  const tipoLogradouro = address.tipo_logradouro || ''
  if (tipoLogradouro && logradouro) {
    parts.push(`${tipoLogradouro} ${logradouro}`.trim())
  } else if (logradouro) {
    parts.push(logradouro)
  }

  // Add numero
  if (address.numero) {
    parts.push(address.numero)
  }

  // Add bairro
  if (address.bairro) {
    parts.push(address.bairro)
  }

  // Add municipio
  if (address.municipio) {
    parts.push(address.municipio)
  }

  // Add estado
  if (address.estado) {
    parts.push(address.estado)
  }

  return parts.join(', ')
}

