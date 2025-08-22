'use client'

import { updateOptInStatus } from '@/actions/update-optin-status'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { OptInConfirmationDrawerContent } from './drawer-contents/opt-in-confirmation-drawer-content'

export function OptInSwitch({ authorized }: { authorized: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [showConfirmDrawer, setShowConfirmDrawer] = useState(false)
  const router = useRouter()

  const handleOptInUpdate = async (optin: boolean) => {
    try {
      await updateOptInStatus(optin)
    } catch (error: any) {
      // Redirect to session expired page on any error
      router.push('/sessao-expirada')
      return
    }
  }

  const handleSwitchChange = (checked: boolean) => {
    if (!checked && authorized) {
      // Show confirmation drawer when trying to unauthorize
      setShowConfirmDrawer(true)
    } else {
      // Direct update for enabling authorization
      startTransition(() => {
        handleOptInUpdate(checked)
      })
    }
  }

  const handleConfirmDeactivation = () => {
    startTransition(() => {
      handleOptInUpdate(false)
    })
    setShowConfirmDrawer(false)
  }

  const handleCancelDeactivation = () => {
    setShowConfirmDrawer(false)
  }

  return (
    <>
      <div className="flex items-center space-x-3 mx-4">
        <Switch
          id="consent-switch"
          checked={authorized}
          onCheckedChange={handleSwitchChange}
          className="data-[state=checked]:bg-primary large-switch"
          disabled={isPending}
        />
        <Label
          htmlFor="consent-switch"
          className="text-sm font-medium cursor-pointer text-foreground"
        >
          {authorized ? 'Autorizo' : 'Não autorizo'}
        </Label>
      </div>

      <OptInConfirmationDrawerContent
        open={showConfirmDrawer}
        onOpenChange={setShowConfirmDrawer}
        onConfirm={handleConfirmDeactivation}
        onCancel={handleCancelDeactivation}
        isPending={isPending}
      />
    </>
  )
}
