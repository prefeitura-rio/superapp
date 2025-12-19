'use client'

import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { CustomButton } from '@/components/ui/custom/custom-button'

interface CancelProposalDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPending?: boolean
}

export function CancelProposalDrawer({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: CancelProposalDrawerProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Cancelar proposta"
    >
      <div className="text-foreground">
        <h2 className="text-xl font-medium mb-3">
          Tem certeza que você quer cancelar sua proposta?
        </h2>
        <p className="text-foreground-light text-sm leading-relaxed mb-6">
          Sua proposta comercial para essa oportunidade será cancelada. Isso não
          lhe impedirá de realizar uma nova proposta enquanto essa oportunidade
          estiver disponível.
        </p>

        <CustomButton
          onClick={onConfirm}
          disabled={isPending}
          className="w-full rounded-full h-[46px] bg-primary text-background"
        >
          {isPending ? 'Cancelando...' : 'Cancelar proposta'}
        </CustomButton>
      </div>
    </BottomSheet>
  )
}
