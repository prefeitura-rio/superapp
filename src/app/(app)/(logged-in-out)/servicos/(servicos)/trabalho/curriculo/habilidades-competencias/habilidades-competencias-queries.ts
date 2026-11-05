import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import type { CatalogoPage } from './catalogo'
import {
  getHabilidadesCompetenciasAction,
  listComportamentosAction,
  listConhecimentosDaAreaAction,
  searchAreasAtuacaoAction,
} from './habilidades-competencias-actions'

function proximaPagina(lastPage: CatalogoPage) {
  if (lastPage.data.length === 0) return undefined
  if (lastPage.page * lastPage.pageSize >= lastPage.total) return undefined
  return lastPage.page + 1
}

export function habilidadesCompetenciasQueryOptions() {
  return queryOptions({
    queryKey: ['habilidades-competencias'],
    queryFn: getHabilidadesCompetenciasAction,
  })
}

export function comportamentosQueryOptions() {
  return queryOptions({
    queryKey: ['comportamentos-atitudes'],
    queryFn: listComportamentosAction,
  })
}

export function conhecimentosDaAreaQueryOptions(areaId: number | undefined) {
  return queryOptions({
    queryKey: ['conhecimentos-da-area', areaId],
    queryFn: () => listConhecimentosDaAreaAction(areaId ?? 0),
    enabled: areaId != null,
  })
}

export function areasAtuacaoQueryOptions(busca: string) {
  return infiniteQueryOptions({
    queryKey: ['areas-atuacao', busca],
    queryFn: ({ pageParam }) => searchAreasAtuacaoAction(busca, pageParam),
    initialPageParam: 1,
    getNextPageParam: proximaPagina,
  })
}
