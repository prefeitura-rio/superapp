import { DEFAULT_RISK_STATUS, RISK_STATUS_CONFIG } from '../constants/health'
import { RISK_STATUS_VALUES, type RiskStatusProps } from '../types/health'

export const isValidRiskStatus = (value: string): value is RiskStatusProps => {
  return RISK_STATUS_VALUES.includes(value as RiskStatusProps)
}

export const getRiskStatusConfig = (riskStatus: string | null | undefined) => {
  if (!riskStatus || !(riskStatus in RISK_STATUS_CONFIG)) {
    return DEFAULT_RISK_STATUS
  }
  return RISK_STATUS_CONFIG[riskStatus as RiskStatusProps]
}

export const getRiskStatusDescription = (
  riskLevel: RiskStatusProps
): string => {
  const config = getRiskStatusConfig(riskLevel)
  return config.description || DEFAULT_RISK_STATUS.description
}
