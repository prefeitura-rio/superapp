'use client'

import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { CustomButton } from '@/components/ui/custom/custom-button'
import type { AuthorizedConductor } from '../../mocks/vehicles'

interface RemoveConductorDrawerProps {
  conductor: AuthorizedConductor | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPending: boolean
}

export function RemoveConductorDrawer({
  conductor,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: RemoveConductorDrawerProps) {
  const firstName = conductor?.name.trim().split(/\s+/)[0] ?? ''

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      showHandle
      title={
        firstName ? `Você deseja remover ${firstName}?` : 'Remover condutor'
      }
    >
      {conductor && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <p className="text-base font-medium leading-5 text-card-foreground">
              Você deseja remover {firstName}?
            </p>
            <p className="text-sm leading-5 text-foreground-light">
              O cadastro de {conductor.name} será excluído e esse equipamento
              não estará mais disponível para ele. Para usá-lo novamente será
              necessário um novo cadastramento.
            </p>
          </div>

          <div className="flex gap-2">
            <CustomButton
              size="lg"
              variant="secondary"
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
      )}
    </BottomSheet>
  )
}
