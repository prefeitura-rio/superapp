'use client'

import { RadioList } from '@/components/ui/custom/radio-list'
import { useFormContext } from 'react-hook-form'
import { STATUS_FORMACAO_OPCOES } from './constants'
import type { CurriculoFormacaoFormValues } from './curriculo-formacao-schema'

interface StatusFormacaoDrawerContentProps {
  fieldIndex: number
  onClose?: () => void
}

export function StatusFormacaoDrawerContent({
  fieldIndex,
  onClose,
}: StatusFormacaoDrawerContentProps) {
  const { setValue, watch } = useFormContext<CurriculoFormacaoFormValues>()
  const value =
    watch(`formacaoAcademica.${fieldIndex}.status`) ?? ''

  const handleSelect = (selected: string) => {
    setValue(`formacaoAcademica.${fieldIndex}.status`, selected, {
      shouldValidate: true,
    })
    onClose?.()
  }

  return (
    <div>
      <RadioList
        options={[...STATUS_FORMACAO_OPCOES]}
        value={value}
        onValueChange={handleSelect}
        name={`status-formacao-${fieldIndex}`}
      />
    </div>
  )
}
