'use client'

import { RadioList } from '@/components/ui/custom/radio-list'
import { useFormContext } from 'react-hook-form'
import { TEMPO_PROCURANDO_EMPREGO_OPCOES_DISPLAY } from './constants'
import type { CurriculoSituacaoFormValues } from './curriculo-situacao-schema'

interface TempoProcurandoEmpregoDrawerContentProps {
  onClose?: () => void
}

export function TempoProcurandoEmpregoDrawerContent({
  onClose,
}: TempoProcurandoEmpregoDrawerContentProps) {
  const { setValue, watch } = useFormContext<CurriculoSituacaoFormValues>()
  const value = watch('tempoProcurandoEmprego') ?? ''

  const handleSelect = (selected: string) => {
    setValue('tempoProcurandoEmprego', selected, { shouldValidate: true })
    onClose?.()
  }

  return (
    <div>
      <RadioList
        options={TEMPO_PROCURANDO_EMPREGO_OPCOES_DISPLAY}
        value={value}
        onValueChange={handleSelect}
        name="tempo-procurando-emprego"
      />
    </div>
  )
}
