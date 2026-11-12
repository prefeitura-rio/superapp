import type { RequestStatus } from './types'

const STATUS_MAP: Record<string, RequestStatus> = {
  'Em andamento': 'Em andamento',
  Aberto: 'Aberto',
  Novo: 'Aberto',
  'Em Espera': 'Em andamento',
  Concluído: 'Concluído',
  Concluido: 'Concluído',
  Fechado: 'Concluído',
  Cancelado: 'Cancelado',
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
  return STATUS_MAP[raw] ?? 'Aberto'
}

export function formatDate(iso: string | undefined | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
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

export function filterTabFromParam(
  value: string | string[] | undefined
): string | undefined {
  const param = Array.isArray(value) ? value[0] : value
  return param && Object.hasOwn(FILTRO_PARAM_TO_TAB, param)
    ? FILTRO_PARAM_TO_TAB[param]
    : undefined
}
