'use client'

import { RadioList } from '@/components/ui/custom/radio-list'
import { useFormContext } from 'react-hook-form'
import { useFormacaoApi } from './formacao-api-context'
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
  const { escolaridades, isLoading } = useFormacaoApi()
  const value = watch(`formacaoAcademica.${fieldIndex}.tipoFormacaoId`) ?? ''

  const options = escolaridades.map((item) => ({
    label: item.descricao,
    value: item.id,
  }))

  const handleSelect = (selected: string) => {
    setValue(`formacaoAcademica.${fieldIndex}.tipoFormacaoId`, selected, {
      shouldValidate: true,
    })
    onClose?.()
  }

  if (isLoading) {
    return (
      <div className="py-4 text-center text-muted-foreground text-sm">
        Carregando opções...
      </div>
    )
  }

  return (
    <div>
      <RadioList
        options={options}
        value={value}
        onValueChange={handleSelect}
        name={`tipo-formacao-${fieldIndex}`}
      />
    </div>
  )
}
