'use client'

import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { MEI_LINKS } from '@/constants/mei-links'

interface NoMeiSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NoMeiSheet({ open, onOpenChange }: NoMeiSheetProps) {
  const handleOpenMeiRegistration = () => {
    window.open(MEI_LINKS.REGISTRATION, '_blank', 'noopener,noreferrer')
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Sem Empresa MEI">
      <div className="text-foreground">
        <h2 className="text-xl font-medium mb-3">
          Você não possui uma empresa MEI
        </h2>
        <p className="text-foreground-light text-sm leading-relaxed mb-6">
          Não encontramos nenhuma empresa MEI vinculada ao seu CPF. Se quiser
          abrir uma empresa como Microempreendedor Individual, acesse o botão
          abaixo.
        </p>

        <button
          type="button"
          onClick={handleOpenMeiRegistration}
          className="w-full rounded-full h-[46px] bg-primary text-background font-medium"
        >
          Quero ser MEI
        </button>
      </div>
    </BottomSheet>
  )
}
