'use client'

import { RadioList } from '@/components/ui/custom/radio-list'
import { useFormContext } from 'react-hook-form'
import { SITUACAO_ATUAL_OPCOES } from './constants'
import type { CurriculoSituacaoFormValues } from './curriculo-situacao-schema'

interface SituacaoAtualDrawerContentProps {
  onClose?: () => void
}

export function SituacaoAtualDrawerContent({
  onClose,
}: SituacaoAtualDrawerContentProps) {
  const { setValue, watch } = useFormContext<CurriculoSituacaoFormValues>()
  const value = watch('situacaoAtual') ?? ''

  const handleSelect = (selected: string) => {
    setValue('situacaoAtual', selected, { shouldValidate: true })
    onClose?.()
  }

  return (
    <div>
      <RadioList
        options={[...SITUACAO_ATUAL_OPCOES]}
        value={value}
        onValueChange={handleSelect}
        name="situacao-atual"
      />
    </div>
  )
}
