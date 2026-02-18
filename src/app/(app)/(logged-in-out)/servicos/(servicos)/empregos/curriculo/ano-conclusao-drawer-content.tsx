'use client'

import { RadioList } from '@/components/ui/custom/radio-list'
import { useFormContext } from 'react-hook-form'
import { ANO_CONCLUSAO_FORMACAO_OPCOES } from './constants'
import type { CurriculoFormacaoFormValues } from './curriculo-formacao-schema'

type FormacaoFieldPath = 'formacaoAcademica' | 'formacaoComplementar'

interface AnoConclusaoDrawerContentProps {
  fieldIndex: number
  fieldPath?: FormacaoFieldPath
  onClose?: () => void
}

export function AnoConclusaoDrawerContent({
  fieldIndex,
  fieldPath = 'formacaoAcademica',
  onClose,
}: AnoConclusaoDrawerContentProps) {
  const { setValue, watch } = useFormContext<CurriculoFormacaoFormValues>()
  const value = watch(`${fieldPath}.${fieldIndex}.anoConclusao`) ?? ''

  const handleSelect = (selected: string) => {
    setValue(`${fieldPath}.${fieldIndex}.anoConclusao`, selected, {
      shouldValidate: true,
    })
    onClose?.()
  }

  return (
    <div>
      <RadioList
        options={ANO_CONCLUSAO_FORMACAO_OPCOES}
        value={value}
        onValueChange={handleSelect}
        name={`ano-conclusao-${fieldPath}-${fieldIndex}`}
      />
    </div>
  )
}
