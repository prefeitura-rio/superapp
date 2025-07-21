'use client'

import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { mapRiskToColor } from '@/lib/health-unit-utils'

interface WalletHealthStatusDrawerContentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  statusValue?: string
  risco?: string
}

const statusBgClassMap: Record<string, string> = {
  verde: 'bg-card-3',
  amarelo: 'bg-card-5',
  laranja: 'bg-card-5',
  vermelho: 'bg-destructive',
  cinza: 'bg-card-foreground/40',
}

const statusTextClassMap: Record<string, string> = {
  verde: 'text-card-3',
  amarelo: 'text-card-5',
  laranja: 'text-card-5',
  vermelho: 'text-destructive',
}

export function WalletHealthStatusDrawerContent({
  open,
  onOpenChange,
  statusValue,
  risco,
}: WalletHealthStatusDrawerContentProps) {
  // Check if risco is a valid risk level
  const validRiskLevels = ['Verde', 'Amarelo', 'Laranja', 'Vermelho']
  const isValidRisk = risco && validRiskLevels.includes(risco)

  const color = isValidRisk ? mapRiskToColor(risco) : 'cinza'
  const displayRisk = isValidRisk ? risco : 'Status indisponível'

  const getRiskDescription = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'Verde':
        return 'A Clínica está funcionando normalmente. Os atendimentos seguem como de costume, com todos os serviços.'
      case 'Amarelo':
        return 'Essa área está com risco moderado. A equipe de saúde continuará trabalhando, mas não realizará visitas domiciliares.'
      case 'Laranja':
        return 'Essa área estava em situação de risco alto, e passa por reavaliação de segurança. Os atendimentos seguem somente dentro da unidade.'
      case 'Vermelho':
        return 'Essa área está em situação de risco grave. A unidade será fechada por segurança. Consulte a situação da unidade dentro de algumas horas.'
      default:
        return 'Não há informações disponíveis. Consulte a unidade para mais informações. Finais de semana e feriados podem ter horários diferentes.'
    }
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Status">
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`inline-block w-4 h-4 rounded-full ${statusBgClassMap[color] || 'bg-gray-400'} border-3 border-background/60`}
        />
        <span
          className={`${statusTextClassMap[color] || 'text-foreground-light'} font-medium text-lg`}
        >
          {displayRisk}
        </span>
      </div>

      <div className="text-base text-foreground">
        {isValidRisk ? getRiskDescription(risco!) : getRiskDescription('')}
      </div>
      <div className="text-sm pt-2 text-foreground-light">
        Consulte a unidade para mais informações. Finais de semana e feriados
        podem ter horários diferentes.
      </div>
    </BottomSheet>
  )
}
