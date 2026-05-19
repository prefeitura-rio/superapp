'use client'

import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import toast from 'react-hot-toast'
import { saveTermosAcceptAction } from './save-termos-accept-action'

interface TermosUsoAccordionContentProps {
  cpf?: string
  onCancel?: () => void
}

export function TermosUsoAccordionContent({
  cpf,
  onCancel,
}: TermosUsoAccordionContentProps) {
  const { setValue, trigger, getValues } = useFormContext()
  const [isSaving, setIsSaving] = useState(false)
  const alreadyAccepted = getValues('termosAceitos') === true
  const [localChecked, setLocalChecked] = useState<boolean>(alreadyAccepted)

  const handleSave = async () => {
    if (!localChecked) {
      setValue('termosAceitos', false)
      void trigger('termosAceitos')
      onCancel?.()
      return
    }

    setIsSaving(true)
    try {
      if (cpf?.trim()) {
        const result = await saveTermosAcceptAction(cpf)
        if (result.success) {
          setValue('termosAceitos', true)
          toast.success('Termos de uso aceitos e registrados')
          onCancel?.()
        } else {
          toast.error('Não foi possível registrar o aceite. Tente novamente.')
        }
      } else {
        setValue('termosAceitos', true)
        onCancel?.()
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setLocalChecked(false)
    onCancel?.()
  }

  return (
    <div className="space-y-6">
      <p className="text-primary text-sm font-normal leading-5">
        Ao preencher e enviar este formulário, você declara que leu e concorda
        com nossos{' '}
        <Link href="/servicos/trabalho/termos-de-uso" className="underline">
          Termos de Uso e nosso Aviso de Privacidade
        </Link>
        . Seus dados serão compartilhados com a instituição responsável por esta
        vaga para fins de recrutamento e seleção.
      </p>

      <div
        className={`flex items-center justify-between ${alreadyAccepted ? 'cursor-default' : 'cursor-pointer'}`}
        onClick={() => {
          if (!alreadyAccepted) setLocalChecked(prev => !prev)
        }}
        onKeyDown={e => {
          if (!alreadyAccepted && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            setLocalChecked(prev => !prev)
          }
        }}
        role="button"
        tabIndex={0}
      >
        <span className="text-foreground text-sm font-normal leading-5">
          Li e concordo com os termos de uso
        </span>
        <Checkbox
          checked={localChecked}
          disabled={alreadyAccepted}
          onCheckedChange={checked => {
            if (!alreadyAccepted) setLocalChecked(checked === true)
          }}
          onClick={e => e.stopPropagation()}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleCancel}
          className="flex flex-1 items-center justify-center gap-(--button-large-spacing,12px) rounded-(--button-small-radius-pill,999px) bg-(--theme-color-card,#F1F1F4) px-(--button-large-h-padding,24px) py-(--button-large-v-padding,16px) text-sm font-medium text-foreground"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || alreadyAccepted}
          className="flex flex-1 items-center justify-center gap-(--button-large-spacing,12px) rounded-(--button-small-radius-pill,999px) bg-(--theme-color-primary,#13335A) px-(--button-large-h-padding,24px) py-(--button-large-v-padding,16px) text-sm font-medium text-white disabled:opacity-50"
        >
          Salvar
        </button>
      </div>
    </div>
  )
}
