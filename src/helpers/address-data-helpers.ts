export interface AddressData {
  logradouro?: string | null
  numero?: string | null
  bairro?: string | null
  municipio?: string | null
  estado?: string | null
  tipo_logradouro?: string | null
  complemento?: string | null
  cep?: string | null
}

/**
 * O RMI pode devolver a string literal "null" nos campos de endereço: é o
 * estado em que ficaram os cidadãos que usaram a antiga exclusão de endereço
 * do app. Esses valores contam como ausentes.
 */
export function isValidAddressValue(value: string | null | undefined): boolean {
  if (!value) {
    return false
  }

  const trimmed = String(value).trim()

  return trimmed !== '' && trimmed.toLowerCase() !== 'null'
}

/**
 * Endereço utilizável para inscrição em cursos e vagas: exige logradouro,
 * bairro e município.
 */
export function hasValidAddress(
  address: AddressData | null | undefined
): boolean {
  if (!address) {
    return false
  }

  return (
    isValidAddressValue(address.logradouro) &&
    isValidAddressValue(address.bairro) &&
    isValidAddressValue(address.municipio)
  )
}

/** Endereço formatado para exibição, ignorando as partes ausentes. */
export function formatAddress(
  address: AddressData | null | undefined,
  fallback = 'Endereço não cadastrado'
): string {
  if (!address) {
    return fallback
  }

  const parts = [
    address.logradouro,
    address.numero,
    address.bairro,
    address.municipio,
    address.estado,
  ]
    .filter(isValidAddressValue)
    .map(part => String(part).trim())

  return parts.length > 0 ? parts.join(', ') : fallback
}
