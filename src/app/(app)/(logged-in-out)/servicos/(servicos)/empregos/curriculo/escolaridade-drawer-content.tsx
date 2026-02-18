'use client'

import { RadioList } from '@/components/ui/custom/radio-list'
import { useFormContext } from 'react-hook-form'
import { ESCOLARIDADE_OPCOES } from './constants'
import type { CurriculoFormacaoFormValues } from './curriculo-formacao-schema.ts'

interface EscolaridadeDrawerContentProps {
  onClose?: () => void
}

export function EscolaridadeDrawerContent({
  onClose,
}: EscolaridadeDrawerContentProps) {
  const { setValue, watch } = useFormContext<CurriculoFormacaoFormValues>()
  const value = watch('escolaridade') ?? ''

  const handleSelect = (selected: string) => {
    setValue('escolaridade', selected, { shouldValidate: true })
    onClose?.()
  }

  return (
    <div>
      <RadioList
        options={[...ESCOLARIDADE_OPCOES]}
        value={value}
        onValueChange={handleSelect}
        name="escolaridade"
      />
    </div>
  )
}
