'use client'

import { RadioList } from '@/components/ui/custom/radio-list'
import { useFormContext } from 'react-hook-form'
import { IDIOMAS_OPCOES } from './constants'
import type { CurriculoFormacaoFormValues } from './curriculo-formacao-schema'

interface IdiomaDrawerContentProps {
  fieldIndex: number
  onClose?: () => void
}

export function IdiomaDrawerContent({
  fieldIndex,
  onClose,
}: IdiomaDrawerContentProps) {
  const { setValue, watch } = useFormContext<CurriculoFormacaoFormValues>()
  const value = watch(`idiomas.${fieldIndex}.idioma`) ?? ''

  const handleSelect = (selected: string) => {
    setValue(`idiomas.${fieldIndex}.idioma`, selected, {
      shouldValidate: true,
    })
    onClose?.()
  }

  return (
    <div>
      <RadioList
        options={[...IDIOMAS_OPCOES]}
        value={value}
        onValueChange={handleSelect}
        name={`idioma-${fieldIndex}`}
      />
    </div>
  )
}
