'use client'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useState } from 'react'
import { SecondaryHeader } from '../../components/secondary-header'

export default function ConsentForm() {
  const [authorized, setAuthorized] = useState(false)

  return (
    <>
      <div className="max-w-md mx-auto pt-24 flex flex-col space-y-6">
        <SecondaryHeader title="Autorizações" />
        <div className="space-y-4 mx-4 ">
          <h1 className="text-xl font-medium text-primary">
            Você autoriza receber comunicações diretas pelos canais da
            Prefeitura do Rio?
          </h1>

          <p className="text-foreground text-sm leading-relaxed">
            Ao ativar as comunicações da Prefeitura do Rio via WhatsApp, você
            passará a receber informações relevantes e personalizadas sobre
            benefícios, serviços públicos, oportunidades e ações da Prefeitura,
            com base no seu perfil.
          </p>

          <p className="text-foreground text-sm leading-relaxed">
            Mensagens de caráter urgente ou emergencial poderão ser enviadas
            independentemente das preferências selecionadas.
          </p>
        </div>

        <div className="flex items-center space-x-3 mx-4 ">
          <Switch
            id="consent-switch"
            checked={authorized}
            onCheckedChange={setAuthorized}
            className="data-[state=checked]:bg-primary"
          />
          <Label
            htmlFor="consent-switch"
            className="text-sm font-medium cursor-pointer text-foreground"
          >
            {authorized ? 'Autorizo' : 'Não autorizo'}
          </Label>
        </div>
      </div>
    </>
  )
}
