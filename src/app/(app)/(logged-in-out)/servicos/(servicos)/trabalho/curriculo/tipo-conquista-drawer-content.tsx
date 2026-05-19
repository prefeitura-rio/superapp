'use client'

import { RadioList } from '@/components/ui/custom/radio-list'
import { useFormContext } from 'react-hook-form'
import { useExperienciaApi } from './experiencia-api-context'

interface TipoConquistaDrawerContentProps {
  fieldIndex: number
  onClose?: () => void
}

export function TipoConquistaDrawerContent({
  fieldIndex,
  onClose,
}: TipoConquistaDrawerContentProps) {
  const { setValue, watch } = useFormContext()
  const { tiposConquista } = useExperienciaApi()
  const value = watch(`conquistas.${fieldIndex}.idTipoConquista`) ?? ''

  const options = tiposConquista.map(t => ({
    label: t.descricao,
    value: t.id,
  }))

  const handleSelect = (selected: string) => {
    setValue(`conquistas.${fieldIndex}.idTipoConquista`, selected, {
      shouldValidate: true,
    })
    onClose?.()
  }

  return (
    <div>
      <RadioList
        options={options}
        value={value}
        onValueChange={handleSelect}
        name={`tipo-conquista-${fieldIndex}`}
      />
    </div>
  )
}
