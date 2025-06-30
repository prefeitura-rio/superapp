'use client'

import { capitalizeFirstLetter } from '@/app/(private)/components/utils'
import { BottomSheet } from '@/components/ui/custom/bottom-sheet'

interface WalletHealthStatusDrawerContentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  color: string
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
}: WalletHealthStatusDrawerContentProps) {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Status">
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`inline-block w-4 h-4 rounded-full ${statusBgClassMap[color] || ''} border-3 border-background/60`}
        />
        <span
          className={`${statusTextClassMap[color] || ''} font-medium text-lg`}
        >
          {capitalizeFirstLetter(color)}
        </span>
      </div>

      <div className="text-base text-foreground">
        {color === 'verde' &&
          'A Clínica está funcionando normalmente. Os atendimentos seguem como de costume, com todos os serviços.'}
        {color === 'amarelo' &&
          'Essa área está com risco moderado. A equipe de saúde continuará trabalhando, mas não realizará visitas domiciliares.'}
        {color === 'laranja' &&
          'Essa área estava em situação de risco alto, e passa por reavaliação de segurança. Os atendimentos seguem somente dentro da unidade.'}
        {color === 'vermelho' &&
          'Essa área está em situação de risco grave. A unidade será fechada por segurança. Consulte a situação da unidade dentro de algumas horas.'}
      </div>
    </BottomSheet>
  )
}
