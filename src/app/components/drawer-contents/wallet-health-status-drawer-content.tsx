'use client'

import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { getRiskStatusDescription, isValidRiskStatus } from '@/helpers/health'
import {
  DEFAULT_RISK_STATUS,
  RISK_STATUS_CONFIG,
} from '../../../constants/health'
import type { RiskStatusProps } from '../../../types/health'

interface WalletHealthStatusDrawerContentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  riskStatus?: RiskStatusProps
}

export function WalletHealthStatusDrawerContent({
  open,
  onOpenChange,
  riskStatus,
}: WalletHealthStatusDrawerContentProps) {
  // Check if risco is a valid risk level
  const isValidRisk = isValidRiskStatus(riskStatus ?? 'Sem valor definido')

  const displayRisk = isValidRisk ? riskStatus : 'Status indisponível'

  const configStatusColors =
    RISK_STATUS_CONFIG[riskStatus!] || DEFAULT_RISK_STATUS
  const { bgClass, txtClass } = configStatusColors

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Status">
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`inline-block w-4 h-4 rounded-full ${bgClass} border-3 border-background/60`}
        />
        <span className={`${txtClass} font-medium text-lg`}>{displayRisk}</span>
      </div>

      <div className="text-base text-foreground">
        {(isValidRisk && getRiskStatusDescription(riskStatus!)) ||
          DEFAULT_RISK_STATUS.description}
      </div>
    </BottomSheet>
  )
}
