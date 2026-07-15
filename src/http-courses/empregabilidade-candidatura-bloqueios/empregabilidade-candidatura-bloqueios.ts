import { customFetch } from '../../../custom-fetch-course'

export interface CandidaturaBloqueioPayload {
  cpf: string
  id_vaga: string
  criterios_nao_atendidos: string[]
}

export interface CandidaturaBloqueio {
  id: string
  cpf: string
  id_vaga: string
  criterios_nao_atendidos: string[]
  created_at: string
}

interface PaginatedResponse<T> {
  data: T[]
  meta: { page: number; page_size: number; total: number }
}

export type GetCandidaturaBloqueiosParams = {
  cpf: string
  id_vaga: string
}

export const getCandidaturaBloqueios = async (
  params: GetCandidaturaBloqueiosParams
): Promise<{
  data: PaginatedResponse<CandidaturaBloqueio> | null
  status: number
}> => {
  const searchParams = new URLSearchParams({
    cpf: params.cpf,
    id_vaga: params.id_vaga,
  })
  return customFetch(
    `/api/v1/empregabilidade/candidatura-bloqueios?${searchParams.toString()}`,
    { method: 'GET' }
  )
}

export const postCandidaturaBloqueio = async (
  payload: CandidaturaBloqueioPayload
): Promise<{ data: CandidaturaBloqueio | null; status: number }> => {
  return customFetch('/api/v1/empregabilidade/candidatura-bloqueios', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
