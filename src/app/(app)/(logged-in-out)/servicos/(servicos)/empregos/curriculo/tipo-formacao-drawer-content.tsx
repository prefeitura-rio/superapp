'use client'

import { RadioList } from '@/components/ui/custom/radio-list'
import { useFormContext } from 'react-hook-form'
import { TIPO_FORMACAO_OPCOES } from './constants'
import type { CurriculoFormacaoFormValues } from './curriculo-formacao-schema'

interface TipoFormacaoDrawerContentProps {
  fieldIndex: number
  onClose?: () => void
}

export function TipoFormacaoDrawerContent({
  fieldIndex,
  onClose,
}: TipoFormacaoDrawerContentProps) {
  const { setValue, watch } = useFormContext<CurriculoFormacaoFormValues>()
  const value = watch(`formacaoAcademica.${fieldIndex}.tipoFormacao`) ?? ''

  const handleSelect = (selected: string) => {
    setValue(`formacaoAcademica.${fieldIndex}.tipoFormacao`, selected, {
      shouldValidate: true,
    })
    onClose?.()
  }

  return (
    <div>
      <RadioList
        options={[...TIPO_FORMACAO_OPCOES]}
        value={value}
        onValueChange={handleSelect}
        name={`tipo-formacao-${fieldIndex}`}
      />
    </div>
  )
}
