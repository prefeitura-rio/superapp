import type { RequestStatus } from '../types'

const STATUS_BG: Record<RequestStatus, string> = {
  Aberto: 'var(--status-badge-open, #0069a8)',
  'Em andamento': 'var(--status-badge-in-progress, #bb4d00)',
  Concluído: 'var(--status-badge-done, #007a55)',
  Cancelado: 'var(--status-badge-canceled, #71717b)',
}

const badgeTextStyle: React.CSSProperties = {
  color: 'var(--status-badge-foreground, #f9fafb)',
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
