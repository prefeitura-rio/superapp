'use client'

import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { MEI_LINKS } from '@/constants/mei-links'

interface IrregularStatusSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function IrregularStatusSheet({
  open,
  onOpenChange,
}: IrregularStatusSheetProps) {
  const handleOpenRegularization = () => {
    window.open(MEI_LINKS.REGULARIZATION, '_blank', 'noopener,noreferrer')
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Situação Cadastral Irregular"
    >
      <div className="text-foreground">
        <h2 className="text-xl font-medium mb-3">
          Sua empresa não possui situação cadastral ativa
        </h2>
        <p className="text-foreground-light text-sm leading-relaxed mb-6">
          Para regularizar a situação cadastral da sua MEI, acesse o Portal do
          Empreendedor para pagar débitos pendentes
        </p>

        <button
          type="button"
          onClick={handleOpenRegularization}
          className="w-full rounded-full h-[46px] bg-primary text-background font-medium"
        >
          Regularizar situação
        </button>
      </div>
    </BottomSheet>
  )
}
