'use client'

import { updateOptInStatus } from '@/actions/update-optin-status'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useState, useTransition } from 'react'
import { OptInConfirmationDrawerContent } from './drawer-contents/opt-in-confirmation-drawer-content'

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
