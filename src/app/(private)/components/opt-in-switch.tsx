'use client'

import { updateOptInStatus } from '@/actions/update-optin-status'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useTransition } from 'react'

export function OptInSwitch({ authorized }: { authorized: boolean }) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex items-center space-x-3 mx-4 ">
      <Switch
        id="consent-switch"
        checked={authorized}
        onCheckedChange={checked => {
          startTransition(() => {
            updateOptInStatus(checked)
          })
        }}
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
  )
}
