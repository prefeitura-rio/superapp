export const RISK_STATUS_VALUES = [
  'Verde',
  'Amarelo',
  'Laranja',
  'Vermelho',
] as const

export type RiskStatusProps = (typeof RISK_STATUS_VALUES)[number]
