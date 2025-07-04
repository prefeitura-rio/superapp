'use client'

import { capitalizeFirstLetter } from '@/app/(private)/components/utils'
import { BottomSheet } from '@/components/ui/custom/bottom-sheet'

interface WalletHealthStatusDrawerContentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  color: string
  statusValue?: string
}

const statusBgClassMap: Record<string, string> = {
  verde: 'bg-card-3',
  amarelo: 'bg-card-5',
  laranja: 'bg-card-5',
  vermelho: 'bg-destructive',
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
  color,
  statusValue,
}: WalletHealthStatusDrawerContentProps) {
  const displayStatus = statusValue || capitalizeFirstLetter(color)

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Status">
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`inline-block w-4 h-4 rounded-full ${statusBgClassMap[color] || ''} border-3 border-background/60`}
        />
        <span
          className={`${statusTextClassMap[color] || ''} font-medium text-lg`}
        >
          {displayStatus}
        </span>
      </div>

      <div className="text-base text-foreground">
        {(statusValue === 'Aberto' || color === 'verde') &&
          'A Clínica está funcionando normalmente. Consulte a unidade para mais informações. Finais de semana e feriados podem ter horários diferentes.'}
        {(statusValue === 'Fechado' || color === 'vermelho') &&
          'A Clínica está fechada. Consulte a unidade para mais informações. Finais de semana e feriados podem ter horários diferentes.'}
      </div>
    </BottomSheet>
  )
}
