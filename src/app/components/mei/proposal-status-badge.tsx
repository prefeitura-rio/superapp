'use client'

import { CheckCircleIcon } from '@/assets/icons/check-circle-icon'
import { ClockIcon } from '@/assets/icons/clock-icon'
import { XCircleIcon } from '@/assets/icons/x-circle-icon'
import { cn } from '@/lib/utils'

type ProposalStatusType = 'submitted' | 'approved' | 'rejected'

interface ProposalStatusBadgeProps {
  status: ProposalStatusType
  deadlineDate?: string
}

const STATUS_CONFIG: Record<
  ProposalStatusType,
  {
    icon: typeof ClockIcon
    iconColor: string
    bgColor: string
    getText: (deadline?: string) => string
  }
> = {
  submitted: {
    icon: ClockIcon,
    iconColor: 'text-foreground-light',
    bgColor: 'bg-secondary',
    getText: () =>
      'Sua proposta foi enviada e está sendo avaliada pela organização responsável.',
  },
  approved: {
    icon: CheckCircleIcon,
    iconColor: 'text-success',
    bgColor: 'bg-success/10',
    getText: (deadline) =>
      deadline
        ? `Sua proposta foi aprovada. Você tem até o dia ${deadline} para concluí-la.`
        : 'Sua proposta foi aprovada.',
  },
  rejected: {
    icon: XCircleIcon,
    iconColor: 'text-destructive',
    bgColor: 'bg-destructive/10',
    getText: () => 'Sua proposta foi recusada.',
  },
}

export function ProposalStatusBadge({
  status,
  deadlineDate,
}: ProposalStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <div className="flex items-center gap-3 bg-card rounded-lg px-4 py-3">
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
          config.bgColor
        )}
      >
        <Icon className={cn('w-5 h-5', config.iconColor)} />
      </div>
      <p className="text-foreground-light text-xs">
        {config.getText(deadlineDate)}
      </p>
    </div>
  )
}
