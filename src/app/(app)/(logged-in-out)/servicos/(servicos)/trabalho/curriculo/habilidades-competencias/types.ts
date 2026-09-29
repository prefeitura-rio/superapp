export interface HabilidadeVinculoViewModel {
  idTupla: number
  nome: string
  checked: boolean
}

export interface AreaAtuacaoViewModel {
  nome: string
  vinculos: HabilidadeVinculoViewModel[]
  checked: boolean
}

export interface ComportamentoAtitudeViewModel {
  id: number
  nome: string
  clicked: boolean
}

export interface HabilidadesCompetenciasData {
  areasAtuacao: AreaAtuacaoViewModel[]
  comportamentoAtitudes: ComportamentoAtitudeViewModel[]
}

export interface HabilidadesCompetenciasPayload {
  area_atuacao_habilidade_ids: number[]
  comportamento_atitudes_ids: number[]
}
