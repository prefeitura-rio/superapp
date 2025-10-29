export interface ServiceFromPortalInterno {
  id?: string
  autor: string
  awaiting_approval?: boolean
  canais_digitais?: string[]
  canais_presenciais?: string[]
  created_at?: number
  custo_servico: string
  descricao_completa: string
  documentos_necessarios?: string[]
  embedding?: number[]
  fixar_destaque?: boolean
  instrucoes_solicitante?: string
  is_free?: boolean
  last_update?: number
  legislacao_relacionada?: string[]
  nome_servico: string
  orgao_gestor: string[] // Array no backend
  publico_especifico?: string[] // Array no backend
  published_at?: number
  resultado_solicitacao: string
  resumo: string
  search_content?: string
  servico_nao_cobre?: string
  status?: number // 0=Draft, 1=Published
  tema_geral: string
  tempo_atendimento: string
  service_url?: string
}
