'use client'

import { updateOptInStatus } from '@/actions/update-optin-status'
import { CustomButton } from '@/components/ui/custom/custom-button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useState, useTransition } from 'react'

export function OptInSwitch({ authorized }: { authorized: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [showConfirmDrawer, setShowConfirmDrawer] = useState(false)

  const handleSwitchChange = (checked: boolean) => {
    if (!checked && authorized) {
      // Show confirmation drawer when trying to unauthorize
      setShowConfirmDrawer(true)
    } else {
      // Direct update for enabling authorization
      startTransition(() => {
        updateOptInStatus(checked)
      })
    }
  }

  const handleConfirmDeactivation = () => {
    startTransition(() => {
      updateOptInStatus(false)
    })
    setShowConfirmDrawer(false)
  }

  const handleCancelDeactivation = () => {
    setShowConfirmDrawer(false)
  }

  return (
    <>
      <div className="flex items-center space-x-3 mx-4 ">
        <Switch
          id="consent-switch"
          checked={authorized}
          onCheckedChange={handleSwitchChange}
          className="data-[state=checked]:bg-primary"
          disabled={isPending}
        />
        <Label
          htmlFor="consent-switch"
          className="text-sm font-medium cursor-pointer text-foreground"
        >
          {authorized ? 'Autorizo' : 'Não autorizo'}
        </Label>
      </div>

      <Drawer open={showConfirmDrawer} onOpenChange={setShowConfirmDrawer}>
        <DrawerContent className="p-8 max-w-md mx-auto !rounded-t-3xl">
          <div className="flex justify-center pt-0 pb-1">
            <div className="w-7 h-1 -mt-2 rounded-full bg-popover-line" />
          </div>
          <DrawerHeader className="sr-only">
            <DrawerTitle>Confirmar desativação</DrawerTitle>
          </DrawerHeader>

          <div className="flex flex-col gap-6 pt-4">
            {/* Content */}
            <div className="space-y-4">
              <p className="text-base text-popover-foreground leading-6">
                Tem certeza que deseja desativar as comunicações da Prefeitura
                do Rio?
              </p>

              <div className="text-sm text-muted-foreground leading-5 space-y-4">
                <p>
                  Ao desativar, você deixará de receber informações
                  personalizadas sobre benefícios, campanhas, eventos e
                  oportunidades relevantes para o seu perfil.
                </p>

                <p>
                  Essa é a forma mais direta de manter uma relação próxima com a
                  Prefeitura e acompanhar novidades que podem facilitar seu dia
                  a dia.
                </p>

                <p>
                  Você ainda poderá reativar as comunicações a qualquer momento.
                </p>
              </div>
            </div>

            {/* Button section */}
            <div className="flex gap-2">
              <CustomButton
                size="lg"
                className="flex-1"
                onClick={handleConfirmDeactivation}
                disabled={isPending}
              >
                Confirmar
              </CustomButton>

              <CustomButton
                size="lg"
                variant="secondary"
                className="flex-1"
                onClick={handleCancelDeactivation}
                disabled={isPending}
              >
                Cancelar
              </CustomButton>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
