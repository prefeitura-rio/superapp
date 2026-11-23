import type { RequestStatus } from './types'

/**
 * Chaves em minúsculas e sem acento (ver `chaveStatus`). Cobre os status do
 * Salesforce e os do 1746 legado (SGRC), agrupados como na carteira
 * (`src/lib/maintenance-requests-utils.ts`).
 */
const STATUS_MAP: Record<string, RequestStatus> = {
  // Salesforce
  novo: 'Aberto',
  aberto: 'Aberto',
  'em andamento': 'Em andamento',
  'em espera': 'Em andamento',
  concluido: 'Concluído',
  fechado: 'Concluído',
  cancelado: 'Cancelado',
  // SGRC
  pendente: 'Em andamento',
  'em andamento privado': 'Em andamento',
  'encaminhado a comlurb - residuo': 'Em andamento',
  'nao constatado': 'Cancelado',
  recusado: 'Cancelado',
  'sem possibilidade de atendimento': 'Cancelado',
  'fechado sem solucao': 'Cancelado',
}

function chaveStatus(raw: string): string {
  return raw.trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
}

const CATEGORIA_MAP: Record<string, string> = {
  Solicitação: 'Serviços',
  Informação: 'Serviços',
  Elogio: 'Ouvidoria',
  Sugestão: 'Ouvidoria',
  Reclamação: 'Ouvidoria',
}

export function mapCategoria(raw: string | undefined | null): string {
  if (!raw) return 'Serviços'
  return CATEGORIA_MAP[raw] ?? raw
}

export function normalizeStatus(raw: string | undefined | null): RequestStatus {
  if (!raw) return 'Aberto'
  const chave = chaveStatus(raw)
  const status = STATUS_MAP[chave]
  if (status) return status
  // "Fechado com solução", "Fechado de ofício", "Fechado com providências"…
  if (chave.startsWith('fechado')) return 'Concluído'
  return 'Aberto'
}

export function formatDate(iso: string | undefined | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const day = String(d.getDate()).padStart(2, '0')
  const month = d
    .toLocaleDateString('pt-BR', { month: 'short' })
    .toUpperCase()
    .replace('.', '')
  const year = String(d.getFullYear()).slice(-2)
  return `${day} ${month} ${year}`
}

/**
 * Aba aberta por `?filtro=` (o menu global leva Ouvidoria e Lei de Acesso à
 * Informação direto para a aba correspondente).
 */
const FILTRO_PARAM_TO_TAB: Record<string, string> = {
  servicos: 'Serviços',
  ouvidoria: 'Ouvidoria',
  'acesso-a-informacao': 'Acesso à informação',
}

export const TAB_TO_FILTRO_PARAM: Record<string, string> = {
  Serviços: 'servicos',
  Ouvidoria: 'ouvidoria',
  'Acesso à informação': 'acesso-a-informacao',
}

export function filterTabFromParam(
  value: string | string[] | undefined
): string | undefined {
  const param = Array.isArray(value) ? value[0] : value
  return param && Object.hasOwn(FILTRO_PARAM_TO_TAB, param)
    ? FILTRO_PARAM_TO_TAB[param]
    : undefined
}
