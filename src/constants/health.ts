import type { RiskStatusProps } from '../types/health'

// Risk Status Constants

export const RISK_STATUS_CONFIG = {
  Verde: {
    label: 'Risco Baixo',
    description:
      'A Clínica está funcionando normalmente. Os atendimentos seguem como de costume, com todos os serviços.',
    bgClass: 'bg-card-3',
    txtClass: 'text-card-3',
  },
  Amarelo: {
    label: 'Risco Moderado',
    description:
      'Essa área está com risco moderado. A equipe de saúde continuará trabalhando, mas não realizará visitas domiciliares.',
    bgClass: 'bg-card-5',
    txtClass: 'text-card-5',
  },
  Laranja: {
    label: 'Risco Alto',
    description:
      'Essa área estava em situação de risco alto, e passa por reavaliação de segurança. Os atendimentos seguem somente dentro da unidade.',
    bgClass: 'bg-card-5',
    txtClass: 'text-card-5',
  },
  Vermelho: {
    label: 'Risco Grave',
    description:
      'Essa área está em situação de risco grave. A unidade será fechada por segurança. Consulte a situação da unidade dentro de algumas horas.',
    bgClass: 'bg-destructive',
    txtClass: 'text-destructive',
  },
} as const satisfies Record<
  RiskStatusProps,
  {
    label: string
    description: string
    bgClass: string
    txtClass: string
  }
>

export const DEFAULT_RISK_STATUS = {
  label: 'Status Indeterminado',
  description:
    'Não há informações disponíveis. Consulte a unidade para mais informações. Finais de semana e feriados podem ter horários diferentes.',
  bgClass: 'bg-card-foreground/40',
  txtClass: 'text-card-foreground/60',
} as const
