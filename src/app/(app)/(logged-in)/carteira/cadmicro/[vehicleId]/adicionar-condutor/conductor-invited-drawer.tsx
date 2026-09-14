'use client'

import { ChevronLeftIcon } from '@/assets/icons'
import { CustomButton } from '@/components/ui/custom/custom-button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import confetti from 'canvas-confetti'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ConductorInvitedDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conductorName: string
  onAddAnother: () => void
}

export function ConductorInvitedDrawer({
  open,
  onOpenChange,
  conductorName,
  onAddAnother,
}: ConductorInvitedDrawerProps) {
  const router = useRouter()

  useEffect(() => {
    if (!open) return

    const timerConfetti = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.7 },
      })
    }, 1000)

    return () => clearTimeout(timerConfetti)
  }, [open])

  const handleFinish = () => {
    onOpenChange(false)
    router.push('/carteira?mobilidade=true')
  }

  const handleAddAnother = () => {
    onOpenChange(false)
    onAddAnother()
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} modal dismissible={false}>
      <DrawerHeader className="sr-only">
        <DrawerTitle className="sr-only">
          Convite para {conductorName} foi enviado
        </DrawerTitle>
      </DrawerHeader>
      <DrawerContent className="max-w-none mx-auto rounded-t-none min-h-screen 3xl:justify-center flex flex-col">
        <div className="flex flex-col min-h-screen 3xl:min-h-[70vh] justify-between bg-background px-4 pt-4 pb-8 max-w-4xl mx-auto w-full">
          <div className="flex flex-col">
            <div className="relative h-11 mb-8 flex items-center">
              <CustomButton
                variant="secondary"
                className="bg-card text-muted-foreground rounded-full w-11 h-11 hover:bg-card/80 outline-none focus:ring-0"
                onClick={handleFinish}
              >
                <ChevronLeftIcon className="text-foreground" />
              </CustomButton>
            </div>

            <h2 className="text-foreground text-3xl font-medium leading-9 tracking-tight">
              Convite para {conductorName} foi enviado!
            </h2>

            <p className="text-foreground-light text-sm font-normal leading-5 mt-2">
              Agora é só aguardar. Assim que a pessoa aceitar o convite você
              será notificado.
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <CustomButton
              size="xl"
              fullWidth
              variant="secondary"
              onClick={handleAddAnother}
            >
              Adicionar condutor
            </CustomButton>
            <CustomButton
              size="xl"
              fullWidth
              variant="primary"
              onClick={handleFinish}
            >
              Finalizar
            </CustomButton>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
