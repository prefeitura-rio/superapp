import type { EmpregabilidadeVaga } from '@/http-courses/models'
import { useQuery } from '@tanstack/react-query'
import type { VagaFilterState } from './vaga-filters'
import { transformVagaToCardData } from './vagas-utils'

interface VagasListResponse {
  data: EmpregabilidadeVaga[]
  meta: { page: number; page_size: number; total: number }
}

/**
 * Mapeia VagaFilterState para query string da rota interna /api/empregos/vagas.
 *
 * tipo_vaga e modalidade passam a descricao (texto) — o route handler resolve os UUIDs.
 * Demais filtros multi-selecionados são passados como params repetidos e o route handler
 * faz requests paralelas + merge/deduplica.
 */
function buildQueryString(filters: VagaFilterState): string {
  const params = new URLSearchParams()

  params.set('status', 'publicado_ativo')
  params.set('pageSize', '100')
  params.set('page', '1')

  const dataPublicacao = filters.data_publicacao
  if (
    typeof dataPublicacao === 'string' &&
    dataPublicacao &&
    dataPublicacao !== 'qualquer'
  ) {
    params.set('data_publicacao', dataPublicacao)
  }

  // tipo_vaga: descricao do regime (ex: 'CLT', 'PJ') — route handler resolve UUID
  const tipoVaga = filters.tipo_vaga
  if (Array.isArray(tipoVaga)) {
    for (const v of tipoVaga) params.append('regime_descricao', v)
  }

  // modalidade: descricao do modelo (ex: 'Presencial', 'Remoto') — route handler resolve UUID
  const modalidade = filters.modalidade
  if (Array.isArray(modalidade)) {
    for (const v of modalidade) params.append('modelo_descricao', v)
  }

  const empresa = filters.empresa
  if (Array.isArray(empresa)) {
    for (const v of empresa) params.append('contratante', v)
  } else if (typeof empresa === 'string' && empresa.trim()) {
    params.append('contratante', empresa.trim())
  }

  const acessibilidade = filters.acessibilidade
  if (Array.isArray(acessibilidade)) {
    for (const v of acessibilidade) params.append('acessibilidade_pcd', v)
  }

  const localizacao = filters.localizacao
  if (Array.isArray(localizacao)) {
    for (const v of localizacao) params.append('bairro', v)
  }

  return params.toString()
}

async function fetchVagasComFiltros(filters: VagaFilterState) {
  const qs = buildQueryString(filters)
  const res = await fetch(`/api/empregos/vagas?${qs}`)

  if (!res.ok) throw new Error('Erro ao buscar vagas')

  const body: VagasListResponse = await res.json()
  const vagas: EmpregabilidadeVaga[] = Array.isArray(body?.data)
    ? body.data
    : []

  return vagas.map(transformVagaToCardData)
}

export function useVagas(filters: VagaFilterState) {
  return useQuery({
    queryKey: ['vagas-filtradas', filters],
    queryFn: () => fetchVagasComFiltros(filters),
    staleTime: 2 * 60 * 1000,
  })
}
