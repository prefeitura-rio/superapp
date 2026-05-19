'use client'

import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { CustomButton } from '@/components/ui/custom/custom-button'

interface DiscardChangesDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDiscard: () => void
  onCancel: () => void
}

export function DiscardChangesDrawer({
  open,
  onOpenChange,
  onDiscard,
  onCancel,
}: DiscardChangesDrawerProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Descartar alterações?"
    >
      <div className="flex flex-col gap-6 pt-4">
        <p className="text-base text-popover-foreground leading-6">
          Suas alterações não foram salvas e serão perdidas. Deseja continuar?
        </p>

        <div className="flex gap-2">
          <CustomButton
            size="lg"
            variant="secondary"
            className="flex-1 rounded-full whitespace-nowrap"
            onClick={onCancel}
          >
            Cancelar
          </CustomButton>

          <CustomButton
            size="lg"
            className="flex-1 rounded-full"
            onClick={onDiscard}
          >
            Descartar
          </CustomButton>
        </div>
      </div>
    </BottomSheet>
  )
}
