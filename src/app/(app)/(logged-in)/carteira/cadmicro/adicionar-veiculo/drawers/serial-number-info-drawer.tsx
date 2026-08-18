'use client'

import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { CustomButton } from '@/components/ui/custom/custom-button'

interface SerialNumberInfoDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SerialNumberInfoDrawer({
  open,
  onOpenChange,
}: SerialNumberInfoDrawerProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Onde encontrar o número de série?"
      showHandle
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-base font-medium text-foreground leading-5">
            Onde encontrar o número de série?
          </h2>
          <div className="text-sm text-foreground-light font-normal leading-5">
            <p>
              Ele normalmente fica gravado no quadro, chassi ou em uma etiqueta
              do fabricante.
            </p>
            <ul className="list-disc pl-5">
              <li>
                Bicicletas elétricas: na parte de baixo do quadro, perto dos
                pedais, ou na caixa de direção.
              </li>
              <li>
                Patinetes e autopropelidos: na base, na coluna do guidão ou no
                chassi.
              </li>
            </ul>
            <p>A foto deve mostrar o número completo e estar nítida.</p>
          </div>
        </div>

        <CustomButton
          type="button"
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => onOpenChange(false)}
        >
          Voltar
        </CustomButton>
      </div>
    </BottomSheet>
  )
}
