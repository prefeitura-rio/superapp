export interface CariocaDigitalService {
  // Core fields
  titulo: string
  descricao: string
  url: string
  collection: string
  category: string
  ultima_atualizacao: string
  slug: string
  status: string
  tipo: string

  // Responsible agency
  orgao_gestor: string
  nome_gestor?: string

  // Service information
  informacoes_complementares?: string
  este_servico_nao_cobre?: string
  procedimentos_especiais?: string
  link_acesso?: string
  horario_funcionamento?: string
  como_orgao_atua?: string

  // Steps and processes
  etapas?: string[]
  etapas_detalhadas?: Array<{
    ordem?: number
    descricao: string
    tem_link?: boolean
    link_solicitacao?: string
    em_manutencao?: boolean
  }>

  // Documents
  documentos_necessarios?: string[]
  documentos_detalhados?: Array<{
    ordem?: number
    descricao: string
    obrigatorio?: boolean
    permite_upload?:
      | boolean
      | {
          ID: number
          alt: string
          author: string
          caption: string
          date: string
          description: string
          filename: string
          filesize: number
          icon: string
          id: number
          link: string
          menu_order: number
          mime_type: string
          modified: string
          name: string
          status: string
          subtype: string
          title: string
          type: string
          uploaded_to: number
          url: string
        }
    tem_url?: boolean
    url?: string
  }>
  permite_upload?: boolean

  // Timing and cost
  prazo_esperado?: string
  custo_do_servico?: string
  valor_a_ser_pago?: string
  gratuito?: boolean

  // Target audience and categories
  publico_alvo?: string[]
  temas?: string[]
  atividades?: string[]
  sistema?: string

  // Legal framework
  tem_legislacao?: boolean
  legislacao?: string[]

  // App availability
  disponivel_app?: boolean
  app_android?: string
  app_ios?: string

  // In-person service
  atendimento_presencial?: boolean
  local_presencial?: string

  // Maintenance
  em_manutencao?: boolean

  // Keywords and search
  palavras_chave?: string[]
  search_content: string

  // Highlighting and scoring
  destaque?: boolean
  score_completude?: number

  // Embedding for search
  embedding?: number[]
}

export interface CariocaDigitalServiceHit {
  document: CariocaDigitalService
  highlight: Record<string, unknown>
  highlights: unknown[]
}

export interface CariocaDigitalServicesApiResponse {
  found: number
  hits: CariocaDigitalServiceHit[]
  out_of: number
  page: number
}
