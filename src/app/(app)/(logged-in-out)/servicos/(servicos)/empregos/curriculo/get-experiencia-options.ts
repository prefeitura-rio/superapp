import { getApiV1EmpregabilidadeTiposConquista } from '@/http-courses/empregabilidade-tipos-conquista/empregabilidade-tipos-conquista'
import type {
  ExperienciaOptions,
  TipoConquistaItem,
} from './experiencia-options-types'

function parseTiposConquista(data: unknown): TipoConquistaItem[] {
  const body = data as { data?: Array<{ id?: string; descricao?: string }> }
  const arr = Array.isArray(body?.data) ? body.data : []
  return arr
    .map((item) => ({
      id: item.id ?? '',
      descricao: item.descricao ?? '',
    }))
    .filter((item) => item.id)
}

/**
 * Busca tipos de conquista no server (para o drawer Conquistas ou certificados).
 * Usar apenas em Server Components.
 */
export async function getExperienciaOptions(): Promise<ExperienciaOptions> {
  const res = await getApiV1EmpregabilidadeTiposConquista({ pageSize: 100 })
  return {
    tiposConquista:
      res.status === 200 && res.data ? parseTiposConquista(res.data) : [],
  }
}
