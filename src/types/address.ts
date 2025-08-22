export interface GoogleAddressSuggestion {
  main_text: string
  secondary_text: string
  place_id: string
  numero?: string
}

export interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento: string
  unidade: string
  bairro: string
  localidade: string
  uf: string
  estado: string
  regiao: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
  erro?: boolean
}

export interface AddressFormData {
  number: string
  complement: string
  cep: string
  noNumber: boolean
  noComplement: boolean
  noCep: boolean
}

export interface AddressSubmissionData {
  logradouro: string
  tipo_logradouro: string
  numero: string
  complemento: string
  bairro: string
  municipio: string
  estado: string
  cep: string
}

export interface CepLookupParams {
  uf: string
  cidade: string
  logradouro: string
  numero?: string
}
