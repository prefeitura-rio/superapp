import type { GoogleAddressSuggestion } from '@/types/address'

export interface ParsedAddress {
  logradouro: string
  bairro: string
  cidade: string
  estado: string
  uf: string
}

export interface ParsedAddressForSubmission {
  bairro: string
  municipio: string
  estado: string
}

const STATE_MAPPING: Record<string, string> = {
  Acre: 'AC',
  Alagoas: 'AL',
  Amapá: 'AP',
  Amazonas: 'AM',
  Bahia: 'BA',
  Ceará: 'CE',
  'Distrito Federal': 'DF',
  'Espírito Santo': 'ES',
  Goiás: 'GO',
  Maranhão: 'MA',
  'Mato Grosso': 'MT',
  'Mato Grosso do Sul': 'MS',
  'Minas Gerais': 'MG',
  Pará: 'PA',
  Paraíba: 'PB',
  Paraná: 'PR',
  Pernambuco: 'PE',
  Piauí: 'PI',
  'Rio de Janeiro': 'RJ',
  'Rio Grande do Norte': 'RN',
  'Rio Grande do Sul': 'RS',
  Rondônia: 'RO',
  Roraima: 'RR',
  'Santa Catarina': 'SC',
  'São Paulo': 'SP',
  Sergipe: 'SE',
  Tocantins: 'TO',
}

const STREET_TYPE_REGEX =
  /^(Rua|Avenida|Av\.|Av|R\.|Travessa|Tv\.|Alameda|Al\.|Praça|Pç\.|Estrada|Est\.|Rodovia|Rod\.)\s+/i

export function parseAddressFromGoogle(
  selectedAddress: GoogleAddressSuggestion
): ParsedAddress {
  const logradouro = selectedAddress.main_text
  const secondaryText = selectedAddress.secondary_text

  let cidade = ''
  let uf = ''

  // Parse secondary text to extract city and state
  if (secondaryText.includes(' - ')) {
    const parts = secondaryText.split(' - ')
    const cityPart = parts[0].split(', ').pop() || parts[0]
    cidade = cityPart.trim()

    const statePart = parts[1].split(',')[0]
    uf = statePart.trim()
  } else {
    // Fallback: try to parse comma-separated format
    const addressParts = secondaryText.split(', ')
    if (addressParts.length >= 2) {
      for (let i = addressParts.length - 1; i >= 0; i--) {
        const part = addressParts[i]
        if (part.length === 2 && part.match(/^[A-Z]{2}$/)) {
          uf = part
          cidade = addressParts[i - 1] || ''
          break
        }
      }
    }
  }

  // Clean logradouro
  let cleanLogradouro = logradouro
    .replace(/,?\s*\d+\s*$/, '') // Remove numbers at the end
    .replace(/,\s*$/, '') // Remove trailing comma
    .trim()

  // Remove street type prefixes
  const streetTypeMatch = cleanLogradouro.match(STREET_TYPE_REGEX)
  if (streetTypeMatch) {
    cleanLogradouro = cleanLogradouro.replace(STREET_TYPE_REGEX, '').trim()
  }

  // Clean cidade
  cidade = cidade.replace(/,?\s*Brasil\s*$/i, '').trim()

  // Extract bairro (neighborhood)
  const bairro = secondaryText.split(', ')[0] || ''

  return {
    logradouro: cleanLogradouro,
    bairro,
    cidade,
    estado: uf,
    uf,
  }
}

export function parseAddressForSubmission(
  selectedAddress: GoogleAddressSuggestion
): ParsedAddressForSubmission {
  const secondaryText = selectedAddress.secondary_text
  let bairro = ''
  let municipio = ''
  let estado = ''

  if (secondaryText.includes(' - ')) {
    const parts = secondaryText.split(' - ')
    const beforeDash = parts[0].split(', ')

    if (beforeDash.length > 1) {
      bairro = beforeDash[beforeDash.length - 2] || ''
      municipio = beforeDash[beforeDash.length - 1] || ''
    } else {
      municipio = beforeDash[0] || ''
    }

    const afterDash = parts[1].split(',')[0]
    estado = afterDash.trim()
  } else {
    const addressParts = secondaryText.split(', ')
    if (addressParts.length >= 3) {
      bairro = addressParts[0] || ''
      municipio = addressParts[1] || ''
      estado = addressParts[2] || ''
    } else if (addressParts.length === 2) {
      municipio = addressParts[0] || ''
      estado = addressParts[1] || ''
    }
  }

  // Clean values
  municipio = municipio.replace(/,?\s*Brasil\s*$/i, '').trim()
  estado = estado.replace(/,?\s*Brasil\s*$/i, '').trim()

  return { bairro, municipio, estado }
}

export function extractNumberFromAddress(mainText: string): string {
  if (!mainText) return ''

  // Try to match numbers after comma or at the end
  const match = mainText.match(/,\s*(\d+)|(\d+)\s*$/)
  return match ? match[1] || match[2] : ''
}

export function cleanLogradouroForSubmission(mainText: string): string {
  return mainText
    .replace(/,?\s*\d+\s*$/, '') // Remove numbers at the end
    .replace(/,\s*$/, '') // Remove trailing comma
    .trim()
}
