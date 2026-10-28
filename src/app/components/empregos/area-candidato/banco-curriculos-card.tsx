'use client'

import { CustomButton } from '@/components/ui/custom/custom-button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { subtituloBancoCurriculos } from './area-candidato-utils'

interface BancoCurriculosCardProps {
  temCurriculo: boolean
  disponivel: boolean
  salvando: boolean
  onAlterar: (disponivel: boolean) => void
}

/**
 * Controle do banco de currículos: quem já salvou alguma parte do currículo
 * escolhe se os recrutadores podem consultá-lo. Desativar pede confirmação.
 */
export function BancoCurriculosCard({
  temCurriculo,
  disponivel,
  salvando,
  onAlterar,
}: BancoCurriculosCardProps) {
  const [confirmandoSaida, setConfirmandoSaida] = useState(false)

  const handleChange = (ligar: boolean) => {
    if (ligar) {
      onAlterar(true)
      return
    }
    setConfirmandoSaida(true)
  }

  const confirmarSaida = () => {
    setConfirmandoSaida(false)
    onAlterar(false)
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-background px-4 py-4">
        <label htmlFor="banco-curriculos-switch" className="min-w-0 flex-1">
          <span
            className={cn(
              'block text-sm font-medium',
              temCurriculo ? 'text-foreground' : 'text-foreground-light'
            )}
          >
            Banco de Currículos
          </span>
          <span className="mt-0.5 block text-xs leading-4 text-foreground-light">
            {subtituloBancoCurriculos({ temCurriculo, disponivel })}
          </span>
        </label>
        <Switch
          id="banco-curriculos-switch"
          checked={temCurriculo && disponivel}
          onCheckedChange={handleChange}
          disabled={!temCurriculo || salvando}
          className="large-switch data-[state=checked]:bg-primary data-[state=unchecked]:bg-foreground-light/40"
        />
      </div>

      <Dialog open={confirmandoSaida} onOpenChange={setConfirmandoSaida}>
        <DialogContent showCloseButton className="mx-1 gap-6 rounded-2xl">
          <div className="space-y-2 pr-6">
            <DialogTitle className="text-lg font-medium text-foreground">
              Sair do Banco de Currículos?
            </DialogTitle>
            {/* Provisório: o texto do Figma ainda é um placeholder. */}
            <p className="text-sm leading-5 text-foreground-light">
              Seu currículo deixará de aparecer para os recrutadores, mas você
              poderá continuar se candidatando às vagas normalmente.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <CustomButton size="lg" variant="primary" onClick={confirmarSaida}>
              Desativar
            </CustomButton>
            <CustomButton
              size="lg"
              variant="secondary"
              onClick={() => setConfirmandoSaida(false)}
            >
              Cancelar
            </CustomButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
