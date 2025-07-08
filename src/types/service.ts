export interface ServiceDocument {
  ai_processing: boolean
  atendimento_online: boolean
  atendimento_presencial: boolean
  atividades_exercidas: string[]
  campos_preenchidos: number
  casos_de_uso: string[]
  categoria_servico: string
  category: string
  collection: string
  como_orgao_atua?: string
  como_solicitar?: string
  complexidade: string
  custo_servico: string
  descricao: string
  documentos_necessarios: string[]
  documentos_obrigatorios: string[]
  documentos_opcionais: string[]
  enderecos_atendimento: string[]
  etapas_processo: string[]
  fonte_dados: string
  id: string
  informacoes_complementares?: string
  json_raw_backup: Array<{
    content: string
    titulo_secao: string
  }>
  last_update: string
  legislacao_relacionada: string[]
  limitacoes: string[]
  link_relacionados: string[]
  normas_aplicaveis: string[]
  o_que_nao_atende?: string
  objetivo?: string
  observacoes_importantes?: string
  orgao_responsavel: string
  palavras_chave: string[]
  prazo_atendimento?: string
  prazo_execucao?: string
  publico_alvo: string
  requisitos?: string
  score_completude: number
  search_content: string
  secretaria?: string
  servico_gratuito: boolean
  telefones_contato: string[]
  tem_documentos: boolean
  tem_informacoes_completas: boolean
  tem_prazo_definido: boolean
  tipo_servico: string
  titulo: string
  urgencia: string
  url: string
  versao_parser: string
}

export interface ServiceHit {
  document: ServiceDocument
  highlight: Record<string, unknown>
  highlights: unknown[]
}

export interface ServicesApiResponse {
  found: number
  hits: ServiceHit[]
  out_of: number
  page: number
}
