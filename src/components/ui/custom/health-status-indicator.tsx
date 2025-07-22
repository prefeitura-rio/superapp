import { getRiskStatusConfig } from '@/helpers/health'
import type { RiskStatusProps } from '@/types/health'
import { Button } from '../button'

interface HealthStatusIndicatorProps {
  riskStatus: RiskStatusProps
  className?: string
  onClick?: (event: React.MouseEvent) => void
}

export function HealthStatusIndicator({
  riskStatus,
  className,
  onClick,
}: HealthStatusIndicatorProps) {
  const bgClass = getRiskStatusConfig(riskStatus).bgClass

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={`h-[11px] w-[11px] p-0 rounded-full ${bgClass} border-1 border-background/60  ${className} hover:${bgClass} dark:hover:${bgClass}`}
    />
  )
}
