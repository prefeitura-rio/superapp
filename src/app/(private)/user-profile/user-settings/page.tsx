'use client'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useState } from 'react'
import { SecondaryHeader } from '../../components/secondary-header'

export default function UserSettingsForm() {
  const [authorized, setAuthorized] = useState(false)

  return (
    <>
      <div className="max-w-md mx-auto pt-20 flex flex-col space-y-6">
        <SecondaryHeader title="Configurações" />
        <div className="space-y-4 mx-4 ">
          <h1 className="text-xl font-medium text-blue-400">
            Ajuste o modo de cor para oferecer uma melhor experiência visual.
          </h1>
        </div>

        <div className="flex items-center space-x-3 mx-4 ">
          <Switch
            id="consent-switch"
            checked={authorized}
            onCheckedChange={setAuthorized}
            className="data-[state=checked]:bg-blue-500"
          />
          <Label
            htmlFor="consent-switch"
            className="text-sm font-medium cursor-pointer"
          >
            {authorized ? 'Escuro' : 'Claro'}
          </Label>
        </div>
      </div>
    </>
  )
}
