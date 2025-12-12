'use client'

import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { CustomButton } from '@/components/ui/custom/custom-button'

interface ExternalLinkDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  externalUrl: string
}

export function ExternalLinkDrawer({
  open,
  onOpenChange,
  externalUrl,
}: ExternalLinkDrawerProps) {
  const handleConfirm = () => {
    if (externalUrl) {
      window.open(externalUrl, '_blank')
    }
    onOpenChange(false)
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Redirecionamento Externo"
    >
      <div className="flex flex-col gap-6 pt-6 px-2">
        <div className="text-left">
          <h2 className="text-xl font-medium leading-6 tracking-normal mb-3 text-popover-foreground">
            Vamos redirecionar você para um link externo
          </h2>
          <p className="text-muted-foreground text-sm font-normal leading-5 tracking-normal">
            Este conteúdo é gerenciado por um de nossos parceiros externos. O
            processo de acesso e acompanhamento é feito fora do Oportunidades
            Cariocas
          </p>
        </div>

        <div>
          <CustomButton
            type="button"
            onClick={handleConfirm}
            className="bg-primary text-background w-full rounded-full"
          >
            Confirmar
          </CustomButton>
        </div>
      </div>
    </BottomSheet>
  )
}

