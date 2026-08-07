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

export function normalizeStatus(raw: string | undefined | null): RequestStatus {
  if (!raw) return 'Aberto'
  return STATUS_MAP[raw] ?? 'Aberto'
}

export function formatDate(iso: string | undefined | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d
    .toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    })
    .toUpperCase()
    .replace('.', '')
}
