export interface Service1746 {
  // Core fields
  titulo: string
  descricao: string
  url: string
  collection: string
  category: string
  last_update: string

  // Service classification
  tipo_servico: string
  categoria_servico: string
  objetivo?: string
  publico_alvo?: string
  complexidade?: string

  // Responsible agency
  orgao_responsavel: string
  secretaria?: string
  subsecretaria?: string
  coordenacao?: string

  // Process information
  como_solicitar?: string
  etapas_processo?: string[]
  requisitos?: string
  como_orgao_atua?: string

  // Documents
  documentos_necessarios?: string[]
  documentos_obrigatorios?: string[]
  documentos_opcionais?: string[]
  tem_documentos: boolean

  // Timing
  prazo_atendimento?: string
  prazo_resposta?: string
  prazo_execucao?: string
  tempo_estimado?: string
  tem_prazo_definido: boolean

  // Cost information
  custo_servico: string
  valor_taxa?: string
  detalhes_custo?: string
  servico_gratuito: boolean

  // Contact and location
  onde_encontrar?: string
  enderecos_atendimento?: string[]
  telefones_contato?: string[]
  email_contato?: string
  horario_funcionamento?: string

  // Service channels
  atendimento_presencial: boolean
  atendimento_online: boolean

  // Limitations and exclusions
  o_que_nao_atende?: string
  limitacoes?: string[]
  casos_especiais?: string
  observacoes_importantes?: string

  // Activities and use cases
  atividades_exercidas?: string[]
  casos_de_uso?: string[]

  // Legal framework
  base_legal?: string
  legislacao_relacionada?: string[]
  normas_aplicaveis?: string[]

  // Additional information
  informacoes_complementares?: string
  dicas_uteis?: string
  link_relacionados?: string[]

  // Search and keywords
  search_content: string
  palavras_chave?: string[]

  // Scoring and completeness
  score_completude?: number
  campos_preenchidos?: number
  tem_informacoes_completas: boolean

  // Raw backup data
  json_raw_backup?: Array<{
    titulo_secao: string
    content: string
  }>

  // Embedding for search
  embedding?: number[]
}

export interface Service1746Hit {
  document: Service1746
  highlight: Record<string, unknown>
  highlights: unknown[]
}

export interface Service1746ApiResponse {
  found: number
  hits: Service1746Hit[]
  out_of: number
  page: number
}
