/**
 * Type definitions for v2 unified search API
 * Based on the structure returned by /api/v2/search
 */

export interface ServiceData {
  id: string
  autor: string
  awaiting_approval: boolean
  buttons?: Array<{
    descricao: string
    is_enabled: boolean
    ordem: number
    titulo: string
    url_service: string
  }>
  canais_digitais?: string[]
  canais_presenciais?: string[]
  created_at: number
  custo_servico: string
  descricao_completa: string
  descricao_completa_plaintext: string
  documentos_necessarios?: string[]
  documentos_necessarios_plaintext?: string[]
  fixar_destaque: boolean
  instrucoes_solicitante?: string
  instrucoes_solicitante_plaintext?: string
  is_free: boolean
  last_update: number
  legislacao_relacionada?: string[]
  nome_servico: string
  orgao_gestor: string[]
  publico_especifico?: string[]
  published_at: number
  resultado_solicitacao: string
  resultado_solicitacao_plaintext: string
  resumo: string
  resumo_plaintext: string
  search_content: string
  servico_nao_cobre?: string
  slug: string
  status: number
  sub_categoria?: string
  tema_geral: string
  tempo_atendimento: string
}

export interface CourseData {
  id: string
  accessibility: string
  carga_horaria: number
  certificacao_oferecida: boolean
  contato_duvidas: string
  course_management_type: string
  cover_image: string
  created_at: string
  data_inicio: string
  data_limite_inscricoes: string
  data_termino: string
  descricao: string
  enrollment_end_date: string
  enrollment_start_date: string
  expected_results: string
  external_partner_contact: string
  external_partner_logo_url: string
  external_partner_name: string
  external_partner_url: string
  facilitator: string
  formacao_link: string
  formato_aula: string
  has_certificate: boolean
  instituicao: string
  instituicao_id: number
  institutional_logo: string
  is_external_partner: boolean
  is_free: string
  is_visible: boolean
  link_inscricao: string
  local_realizacao: string
  material_used: string
  methodology: string
  modalidade: string
  numero_vagas: number
  objectives: string
  organization: string
  orgao: string
  orgao_id: string
  orgao_sigla: string
  pre_requisitos: string
  program_content: string
  published_at: string
  resources_used: string
  status: string
  target_audience: string
  teaching_material: string
  theme: string
  titulo: string
  turno: string
  updated_at: string
  workload: string
}

export interface JobData {
  id: string
  beneficios: string
  contato_duvidas: string
  created_at: string
  data_inicio_prevista: string
  data_limite_candidatura: string
  descricao: string
  jornada_trabalho: string
  latitude: string
  longitude: string
  numero_vagas: number
  pre_requisitos: string
  salario_max: number
  salario_min: number
  status: string
  tipo_contratacao: string
  titulo: string
  turno: string
  updated_at: string
}

export interface ScoreInfo {
  text_match_normalized: number
  passed_threshold: boolean
}

export interface UnifiedSearchResult {
  id: string
  collection: string
  type: 'service' | 'course' | 'job'
  data: ServiceData | CourseData | JobData
  score_info: ScoreInfo
}

export interface UnifiedSearchResponse {
  results: UnifiedSearchResult[]
  total_count: number
  filtered_count: number
  page: number
  per_page: number
  search_type: string
  collections: string[]
}
