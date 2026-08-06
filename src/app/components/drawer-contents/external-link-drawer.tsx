'use client'

import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { CustomButton } from '@/components/ui/custom/custom-button'

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
            {title}
          </h2>
          <p className="text-muted-foreground text-sm font-normal leading-5 tracking-normal">
            {description}
          </p>
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
