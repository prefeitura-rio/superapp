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
  horario_funcionamento?: string
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
  // Carioca Digital specific fields
  prazo_esperado?: string
  orgao_gestor?: string
  etapas?: string[]
  etapas_detalhadas?: Array<{
    ordem?: number
    descricao: string
    tem_link?: boolean
    link_solicitacao?: string
    em_manutencao?: boolean
  }>
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
  legislacao?: string[]
  custo_do_servico?: string
  valor_a_ser_pago?: string
  este_servico_nao_cobre?: string
  procedimentos_especiais?: string
  disponivel_app?: boolean
  app_android?: string
  app_ios?: string
  local_presencial?: string
  nome_gestor?: string
  link_acesso?: string
  permite_upload?: boolean
  temas?: string[]
  atividades?: string[]
  sistema?: string
  tem_legislacao?: boolean
  destaque?: boolean
  gratuito?: boolean
  ultima_atualizacao?: string
  slug?: string
  status?: string
  tipo?: string
  em_manutencao?: boolean
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
