import { getApiV1EmpregabilidadeEscolaridades } from '@/http-courses/empregabilidade-escolaridades/empregabilidade-escolaridades'
import { getApiV1EmpregabilidadeIdiomas } from '@/http-courses/empregabilidade-idiomas/empregabilidade-idiomas'
import { getApiV1EmpregabilidadeNiveisIdioma } from '@/http-courses/empregabilidade-niveis-idioma/empregabilidade-niveis-idioma'
import type { FormacaoApiItem, FormacaoOptions } from './formacao-options-types'

function parseListResponse(data: unknown): FormacaoApiItem[] {
  const body = data as {
    data?: Array<{ id?: string; descricao?: string }>
  }
  const arr = Array.isArray(body?.data)
    ? body.data
    : Array.isArray(body)
      ? body
      : []
  return arr
    .map((item) => ({
      id: item.id ?? '',
      descricao: item.descricao ?? '',
    }))
    .filter((item) => item.id)
}

/**
 * Busca escolaridades, idiomas e níveis de idioma no server.
 * Usar apenas em Server Components (usa cookies via customFetch).
 */
export async function getFormacaoOptions(): Promise<FormacaoOptions> {
  const [escRes, idiomasRes, niveisRes] = await Promise.all([
    getApiV1EmpregabilidadeEscolaridades({ pageSize: 100 }),
    getApiV1EmpregabilidadeIdiomas({ pageSize: 100 }),
    getApiV1EmpregabilidadeNiveisIdioma({ pageSize: 100 }),
  ])

  return {
    escolaridades:
      escRes.status === 200 && escRes.data
        ? parseListResponse(escRes.data)
        : [],
    idiomas:
      idiomasRes.status === 200 && idiomasRes.data
        ? parseListResponse(idiomasRes.data)
        : [],
    niveisIdioma:
      niveisRes.status === 200 && niveisRes.data
        ? parseListResponse(niveisRes.data)
        : [],
  }
}
