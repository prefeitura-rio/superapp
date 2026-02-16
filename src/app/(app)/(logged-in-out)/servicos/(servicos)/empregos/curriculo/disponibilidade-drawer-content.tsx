'use client'

import { RadioList } from '@/components/ui/custom/radio-list'
import { useFormContext } from 'react-hook-form'
import { DISPONIBILIDADE_OPCOES } from './constants'
import type { CurriculoSituacaoFormValues } from './curriculo-situacao-schema'

interface DisponibilidadeDrawerContentProps {
  onClose?: () => void
}

export function DisponibilidadeDrawerContent({
  onClose,
}: DisponibilidadeDrawerContentProps) {
  const { setValue, watch } = useFormContext<CurriculoSituacaoFormValues>()
  const value = watch('disponibilidade') ?? ''

  const handleSelect = (selected: string) => {
    setValue('disponibilidade', selected, { shouldValidate: true })
    onClose?.()
  }

  return (
    <div>
      <RadioList
        options={[...DISPONIBILIDADE_OPCOES]}
        value={value}
        onValueChange={handleSelect}
        name="disponibilidade"
      />
    </div>
  )
}
