
// Types for the health unit API responses
export interface HealthUnitInfo {
  cnes: string
  nome: string
  logradouro: string | null
  numero: string | null
  complemento: string | null
  cep: string | null
  telefone: string | null
  celular: string | null
  funcionamento_dia_util: {
    inicio: number
    fim: number
  }
  funcionamento_sabado: {
    inicio: number
    fim: number
  } | null
}

export interface HealthUnitRisk {
  cnes: string
  notificacao_ativa: {
    risco: 'Verde' | 'Amarelo' | 'Laranja' | 'Vermelho'
    status: 'Ativo' | 'Encerrado'
    ultima_atualizacao: string | null
  } | null
  ultima_notificacao: {
    risco: 'Verde' | 'Amarelo' | 'Laranja' | 'Vermelho'
    status: 'Ativo' | 'Encerrado'
    ultima_atualizacao: string | null
  } | null
}

// Response types
export type GetHealthUnitInfoResponse = {
  data: HealthUnitInfo
  status: number
  headers: Headers
}

export type GetHealthUnitRiskResponse = {
  data: HealthUnitRisk
  status: number
  headers: Headers
}

// Custom fetch for health unit API
const healthUnitFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const baseUrl = 'https://services.staging.app.dados.rio/subpav-osa-api'
  
  const url = `${baseUrl}${endpoint}`
  
  const headers = {
    'Authorization': `Bearer ${process.env.API_KEY_SUBPAV_OSA_SMS}`,
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  const data = await response.json()

  return {
    data,
    status: response.status,
    headers: response.headers,
  } as T
}

/**
 * Get health unit information by CNES code
 */
export const getHealthUnitInfo = async (
  cnes: string,
  options?: RequestInit
): Promise<GetHealthUnitInfoResponse> => {
  return healthUnitFetch<GetHealthUnitInfoResponse>(
    `/unidade/${cnes}`,
    options
  )
}

/**
 * Get health unit risk status by CNES code
 */
export const getHealthUnitRisk = async (
  cnes: string,
  options?: RequestInit
): Promise<GetHealthUnitRiskResponse> => {
  return healthUnitFetch<GetHealthUnitRiskResponse>(
    `/unidade/${cnes}/risco`,
    options
  )
} 