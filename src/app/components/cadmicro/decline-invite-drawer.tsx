'use client'

import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { CustomButton } from '@/components/ui/custom/custom-button'

interface DeclineInviteDrawerProps {
  vehicleDisplayName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPending: boolean
}

export function DeclineInviteDrawer({
  vehicleDisplayName,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: DeclineInviteDrawerProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      showHandle
      title="Recusar veículo?"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-base font-medium leading-5 text-card-foreground">
            Recusar veículo?
          </p>
          <p className="text-sm leading-5 text-foreground-light">
            Você não será cadastrado como condutor de {vehicleDisplayName} e
            esse equipamento não estará mais disponível.
          </p>
        </div>

        <div className="flex gap-2">
          <CustomButton
            size="lg"
            variant="card"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Voltar
          </CustomButton>
          <CustomButton
            size="lg"
            variant="primary"
            className="flex-1"
            onClick={onConfirm}
            loading={isPending}
          >
            Confirmar
          </CustomButton>
        </div>
      </div>
    </BottomSheet>
  )
}
