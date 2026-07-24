import type { RequestStatus } from '../types'

const STATUS_STYLES: Record<RequestStatus, string> = {
  Aberto: 'bg-blue-500 text-white',
  'Em andamento': 'bg-orange-500 text-white',
  Concluído: 'bg-green-600 text-white',
  Cancelado: 'bg-[var(--gray-300)] text-white',
}

interface StatusBadgeProps {
  status: RequestStatus
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_STYLES[status]} ${className}`}
    >
      {status}
    </span>
  )
}
