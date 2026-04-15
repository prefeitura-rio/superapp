'use client'

import { CustomButton } from '@/components/ui/custom/custom-button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { useRouter } from 'next/navigation'

interface PetRegisteredDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  petName: string
}

export function PetRegisteredDrawer({
  open,
  onOpenChange,
  petName,
}: PetRegisteredDrawerProps) {
  const router = useRouter()

  const handleViewPets = () => {
    onOpenChange(false)
    router.push('/carteira?pets=true')
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} modal dismissible={false}>
      <DrawerHeader className="sr-only">
        <DrawerTitle className="sr-only">
          Pet cadastrado com sucesso
        </DrawerTitle>
      </DrawerHeader>
      <DrawerContent className="max-w-none mx-auto rounded-t-none min-h-screen 3xl:justify-center flex flex-col">
        <div className="flex flex-col min-h-screen 3xl:min-h-[70vh] justify-between bg-background px-4 py-12 max-w-4xl mx-auto w-full">
          <div className="flex flex-col flex-1 gap-6 justify-center">
            <div className="flex flex-col text-left">
              <h2 className="text-foreground text-4xl font-medium leading-10">
                Você concluiu o cadastro de {petName}!
              </h2>

              <p className="text-foreground-light text-sm font-normal leading-5 mt-4">
                Enviaremos mais informações no seu e-mail sobre como realizar a
                Microchipagem do seu animal e incluí-lo no SisBicho.
              </p>
            </div>
          </div>

          <CustomButton
            size="xl"
            fullWidth
            onClick={handleViewPets}
            className="rounded-full"
          >
            <span className="text-primary-foreground">
              Ver pets cadastrados
            </span>
          </CustomButton>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
