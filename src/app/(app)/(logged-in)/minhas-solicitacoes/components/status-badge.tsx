import type { RequestStatus } from '../types'

const STATUS_BG: Record<RequestStatus, string> = {
  Aberto: 'var(--card-2, #0084D1)',
  'Em andamento': 'var(--card-5, #E17100)',
  Concluído: 'var(--card-3, #096)',
  Cancelado: 'var(--foreground-light, #71717B)',
}

const badgeTextStyle: React.CSSProperties = {
  color: '#F9FAFB',
  fontFamily: 'var(--font-family-sans, "DM Sans")',
  fontSize: 'var(--font-size-xs, 12px)',
  fontWeight: 'var(--font-weight-normal, 400)',
  lineHeight: 'var(--font-leading-4, 16px)',
  letterSpacing: 'var(--font-tracking-normal, 0)',
}

interface StatusBadgeProps {
  status: RequestStatus
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center whitespace-nowrap ${className}`}
      style={{
        padding:
          'var(--button-badge-v-padding, 2px) var(--button-badge-h-padding, 12px)',
        gap: 'var(--button-badge-spacing, 4px)',
        borderRadius: 'var(--button-badge-radius-pill, 999px)',
        background: STATUS_BG[status],
        ...badgeTextStyle,
      }}
    >
      {status}
    </span>
  )
}
