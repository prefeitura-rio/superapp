export interface ItemCatalogoViewModel {
  id: number
  nome: string
}

export type AreaAtuacaoViewModel = ItemCatalogoViewModel

export type ConhecimentoViewModel = ItemCatalogoViewModel

export interface ComportamentoAtitudeViewModel {
  id: number
  nome: string
  clicked: boolean
}

export interface HabilidadesCompetenciasData {
  areasAtuacao: AreaAtuacaoViewModel[]
  areaAtuacaoSelecionada: AreaAtuacaoViewModel | null
  conhecimentosSelecionados: ConhecimentoViewModel[]
  comportamentoAtitudes: ComportamentoAtitudeViewModel[]
}

export interface ConhecimentosDaAreaData {
  conhecimentos: ConhecimentoViewModel[]
}

export interface HabilidadesCompetenciasPayload {
  id_area_atuacao: number | null
  habilidade_ids: number[]
  comportamento_atitudes_ids: number[]
}
