'use client'

import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { CustomButton } from '@/components/ui/custom/custom-button'

interface OptInConfirmationDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
}

export function OptInConfirmationDrawerContent({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  isPending,
}: OptInConfirmationDrawerProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      showHandle
      contentClassName="p-8 max-w-md mx-auto !rounded-t-3xl"
    >
      <div className="flex flex-col gap-6 pt-4">
        <div className="space-y-4">
          <p className="text-base text-popover-foreground leading-6">
            Tem certeza que deseja desativar as comunicações da Prefeitura do
            Rio?
          </p>

          <div className="text-sm text-muted-foreground leading-5 space-y-4">
            <p>
              Ao desativar, você deixará de receber informações personalizadas
              sobre benefícios, campanhas, eventos e oportunidades relevantes
              para o seu perfil.
            </p>

            <p>
              Essa é a forma mais direta de manter uma relação próxima com a
              Prefeitura e acompanhar novidades que podem facilitar seu dia a
              dia.
            </p>

            <p>
              Você ainda poderá reativar as comunicações a qualquer momento.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <CustomButton
            size="lg"
            className="flex-1"
            onClick={onConfirm}
            disabled={isPending}
          >
            Confirmar
          </CustomButton>

          <CustomButton
            size="lg"
            variant="secondary"
            className="flex-1"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancelar
          </CustomButton>
        </div>
      </div>
    </BottomSheet>
  )
}
