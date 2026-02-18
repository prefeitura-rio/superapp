'use client'

import { RadioList } from '@/components/ui/custom/radio-list'
import { useFormContext } from 'react-hook-form'
import { TIPO_CONQUISTA_OPCOES } from './constants'

interface TipoConquistaDrawerContentProps {
  fieldIndex: number
  onClose?: () => void
}

export function TipoConquistaDrawerContent({
  fieldIndex,
  onClose,
}: TipoConquistaDrawerContentProps) {
  const { setValue, watch } = useFormContext()
  const value = watch(`conquistas.${fieldIndex}.tipo`) ?? ''

  const handleSelect = (selected: string) => {
    setValue(`conquistas.${fieldIndex}.tipo`, selected, {
      shouldValidate: true,
    })
    onClose?.()
  }

  return (
    <div>
      <RadioList
        options={[...TIPO_CONQUISTA_OPCOES]}
        value={value}
        onValueChange={handleSelect}
        name={`tipo-conquista-${fieldIndex}`}
      />
    </div>
  )
}
