'use server'

import { getApiV1EmpregabilidadeComportamentosAtitudes } from '@/http-courses/empregabilidade-comportamentos-atitudes/empregabilidade-comportamentos-atitudes'
import {
  getApiV1EmpregabilidadeCurriculoHabilidadesCompetencias,
  putApiV1EmpregabilidadeCurriculoHabilidadesCompetencias,
} from '@/http-courses/empregabilidade-curriculo/empregabilidade-curriculo'
import {
  getApiV1EmpregabilidadeHabilidadesAreasAtuacao,
  getApiV1EmpregabilidadeHabilidadesAreasAtuacaoIdHabilidades,
} from '@/http-courses/empregabilidade-habilidades/empregabilidade-habilidades'
import type {
  EmpregabilidadeHabilidadesCompetencias,
  EmpregabilidadeHabilidadesCompetenciasSave,
} from '@/http-courses/models'
import {
  type CatalogoPage,
  type HabilidadesCompetenciasForm,
  PAGE_SIZE,
  comoItem,
  comoLista,
} from './catalogo'

export type HabilidadesActionResult =
  | { ok: true; data: HabilidadesCompetenciasForm }
  | { ok: false; status?: number; error: string }

function paginaVazia(): CatalogoPage {
  return { data: [], total: 0, page: 1, pageSize: PAGE_SIZE }
}

function formularioDe(
  data: EmpregabilidadeHabilidadesCompetencias
): HabilidadesCompetenciasForm {
  return {
    area: comoItem(data.area_atuacao),
    conhecimentos: comoLista(data.conhecimentos),
    comportamentos: comoLista(data.comportamentos_atitudes),
  }
}

export async function getHabilidadesCompetenciasAction(): Promise<HabilidadesActionResult> {
  try {
    const response =
      await getApiV1EmpregabilidadeCurriculoHabilidadesCompetencias()
    if (response.status !== 200) {
      return {
        ok: false,
        status: response.status,
        error: 'Falha ao carregar habilidades e competências',
      }
    }
    return { ok: true, data: formularioDe(response.data) }
  } catch (error) {
    console.error('[getHabilidadesCompetenciasAction]', error)
    return { ok: false, error: 'Falha ao carregar habilidades e competências' }
  }
}

export async function saveHabilidadesCompetenciasAction(
  body: EmpregabilidadeHabilidadesCompetenciasSave
): Promise<HabilidadesActionResult> {
  try {
    const response =
      await putApiV1EmpregabilidadeCurriculoHabilidadesCompetencias(body)
    if (response.status !== 200) {
      return {
        ok: false,
        status: response.status,
        error: 'Não foi possível salvar. Tente novamente.',
      }
    }
    return { ok: true, data: formularioDe(response.data) }
  } catch (error) {
    console.error('[saveHabilidadesCompetenciasAction]', error)
    return { ok: false, error: 'Não foi possível salvar. Tente novamente.' }
  }
}

export async function searchAreasAtuacaoAction(
  q?: string,
  page = 1
): Promise<CatalogoPage> {
  try {
    const response = await getApiV1EmpregabilidadeHabilidadesAreasAtuacao({
      q: q?.trim() || undefined,
      page,
      pageSize: PAGE_SIZE,
    })
    if (response.status !== 200) return paginaVazia()
    return {
      data: comoLista(response.data.data),
      total: response.data.total ?? 0,
      page: response.data.page ?? 1,
      pageSize: response.data.pageSize ?? PAGE_SIZE,
    }
  } catch (error) {
    console.error('[searchAreasAtuacaoAction]', error)
    return paginaVazia()
  }
}

export async function listConhecimentosDaAreaAction(
  areaId: number
): Promise<CatalogoPage> {
  try {
    const response =
      await getApiV1EmpregabilidadeHabilidadesAreasAtuacaoIdHabilidades(
        areaId,
        { page: 1, pageSize: 100 }
      )
    if (response.status !== 200) return paginaVazia()
    return {
      data: comoLista(response.data.data),
      total: response.data.total ?? 0,
      page: response.data.page ?? 1,
      pageSize: response.data.pageSize ?? 100,
    }
  } catch (error) {
    console.error('[listConhecimentosDaAreaAction]', error)
    return paginaVazia()
  }
}

export async function listComportamentosAction(): Promise<CatalogoPage> {
  try {
    const response = await getApiV1EmpregabilidadeComportamentosAtitudes({
      page: 1,
      pageSize: 100,
    })
    if (response.status !== 200) return paginaVazia()
    return {
      data: comoLista(response.data.data),
      total: response.data.total ?? 0,
      page: response.data.page ?? 1,
      pageSize: response.data.pageSize ?? 100,
    }
  } catch (error) {
    console.error('[listComportamentosAction]', error)
    return paginaVazia()
  }
}
