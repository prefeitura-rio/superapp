'use client'

import vehicleSuccessImage from '@/assets/riomob-vehicle-success.svg'
import { CustomButton } from '@/components/ui/custom/custom-button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import confetti from 'canvas-confetti'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface VehicleInviteAcceptedDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VehicleInviteAcceptedDrawer({
  open,
  onOpenChange,
}: VehicleInviteAcceptedDrawerProps) {
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

  const handleViewWallet = () => {
    onOpenChange(false)
    router.push('/carteira?riomob=true')
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} modal dismissible={false}>
      <DrawerHeader className="sr-only">
        <DrawerTitle className="sr-only">
          Veículo adicionado com sucesso
        </DrawerTitle>
      </DrawerHeader>
      <DrawerContent className="max-w-none mx-auto rounded-t-none min-h-screen 3xl:justify-center flex flex-col">
        <div className="flex flex-col min-h-screen 3xl:min-h-[70vh] justify-between bg-background px-4 py-12 max-w-4xl mx-auto w-full">
          <div className="flex flex-col flex-1 gap-6 justify-center items-center text-center">
            <Image
              src={vehicleSuccessImage}
              alt="Ilustração de veículo adicionado com sucesso"
              width={254}
              height={320}
              className="mx-auto object-contain max-h-80"
              priority
            />

            <h2 className="text-foreground text-3xl font-medium leading-9 tracking-tight">
              Veículo adicionado
              <br />
              com sucesso!
            </h2>
          </div>

          <div className="flex flex-col w-full">
            <CustomButton
              size="xl"
              fullWidth
              variant="primary"
              onClick={handleViewWallet}
            >
              Ver Carteira
            </CustomButton>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
