'use client'

import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { DrawerDescription, DrawerTitle } from '@/components/ui/drawer'

interface ExternalLinkDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  externalUrl: string
  /** Copy institucional do contexto que abriu o drawer. Sem valor, mantém a copy da busca. */
  title?: string
  description?: string
}

export function ExternalLinkDrawer({
  open,
  onOpenChange,
  externalUrl,
  title = 'Vamos redirecionar você para um link externo',
  description = 'Esta busca está redirecionando você para um link externo.',
}: ExternalLinkDrawerProps) {
  const handleConfirm = () => {
    if (externalUrl) {
      window.open(externalUrl, '_blank', 'noopener,noreferrer')
    }
    onOpenChange(false)
  }

  return (
    // Sem `title` aqui de propósito: o título/descrição do diálogo são a copy contextual
    // abaixo, via DrawerTitle/DrawerDescription — dois títulos confundiriam o leitor de tela.
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <div className="flex flex-col gap-6 pt-6 px-2">
        <div className="text-left">
          <DrawerTitle className="text-xl font-medium leading-6 tracking-normal mb-3 text-popover-foreground">
            {title}
          </DrawerTitle>
          <DrawerDescription className="text-muted-foreground text-sm font-normal leading-5 tracking-normal">
            {description}
          </DrawerDescription>
        </div>

        <div>
          <CustomButton
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleConfirm}
          >
            Confirmar
          </CustomButton>
        </div>
      </div>
    </BottomSheet>
  )
}
