import { getApiV1EmpregabilidadeDisponibilidades } from '@/http-courses/empregabilidade-disponibilidades/empregabilidade-disponibilidades'
import { getApiV1EmpregabilidadeRegimesContratacao } from '@/http-courses/empregabilidade-regimes-contratacao/empregabilidade-regimes-contratacao'
import { getApiV1EmpregabilidadeSituacoesAtual } from '@/http-courses/empregabilidade-situacoes-atual/empregabilidade-situacoes-atual'
import type {
  SituacaoOptionItem,
  SituacaoOptions,
} from './situacao-options-types'

function parseListResponse(data: unknown): SituacaoOptionItem[] {
  const body = data as { data?: Array<{ id?: string; descricao?: string }> }
  const arr = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : []
  return arr
    .map((item) => ({
      id: item.id ?? '',
      descricao: item.descricao ?? '',
    }))
    .filter((item) => item.id)
}

/**
 * Busca situações atuais, disponibilidades e regimes de contratação no server.
 * Usar apenas em Server Components.
 */
export async function getSituacaoOptions(): Promise<SituacaoOptions> {
  const [situacoesRes, dispRes, regimesRes] = await Promise.all([
    getApiV1EmpregabilidadeSituacoesAtual({ pageSize: 100 }),
    getApiV1EmpregabilidadeDisponibilidades({ pageSize: 100 }),
    getApiV1EmpregabilidadeRegimesContratacao({ pageSize: 100 }),
  ])

  return {
    situacoesAtual:
      situacoesRes.status === 200 && situacoesRes.data
        ? parseListResponse(situacoesRes.data)
        : [],
    disponibilidades:
      dispRes.status === 200 && dispRes.data
        ? parseListResponse(dispRes.data)
        : [],
    regimesContratacao:
      regimesRes.status === 200 && regimesRes.data
        ? parseListResponse(regimesRes.data)
        : [],
  }
}
