'use client'

import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { CustomButton } from '@/components/ui/custom/custom-button'

interface AcceptInviteDrawerProps {
  vehicleDisplayName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPending: boolean
}

export function AcceptInviteDrawer({
  vehicleDisplayName,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: AcceptInviteDrawerProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      showHandle
      title="Aceitar convite?"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-base font-medium leading-5 text-card-foreground">
            Aceitar convite?
          </p>
          <p className="text-sm leading-5 text-foreground-light">
            Ao aceitar, você concorda em compartilhar suas informações pessoais
            de contato (nome, e-mail e celular do seu perfil) com o proprietário
            de {vehicleDisplayName}.
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
