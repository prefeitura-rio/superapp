import type { PortalInternoButton } from './portal-interno'

/**
 * Tipo que representa o serviço completo retornado pela API /api/v1/search/{id}
 * Baseado na estrutura real retornada pelo endpoint
 */
export interface ServiceDetailResponse {
  id: string
  nome_servico: string
  orgao_gestor: string[]
  resumo: string
  tempo_atendimento: string
  custo_servico: string
  resultado_solicitacao: string
  descricao_completa: string
  autor: string
  documentos_necessarios?: string[]
  instrucoes_solicitante?: string
  canais_digitais?: string[]
  canais_presenciais?: string[]
  servico_nao_cobre?: string
  legislacao_relacionada?: string[]
  tema_geral: string
  publico_especifico?: string[]
  fixar_destaque?: boolean
  awaiting_approval?: boolean
  published_at?: number
  is_free?: boolean
  extra_fields?: {
    migrated_at?: number
    source_collection?: string
    source_id?: string
  }
  status?: number
  created_at?: number
  last_update?: number
  search_content?: string
  buttons?: PortalInternoButton[]
  // Campos que podem vir do ModelsServiceDocument base
  category?: string
  title?: string
  description?: string
  updated_at?: number
}

