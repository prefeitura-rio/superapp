'use client'

import { RadioList } from '@/components/ui/custom/radio-list'
import { useFormContext } from 'react-hook-form'
import { NIVEL_IDIOMA_OPCOES } from './constants'
import type { CurriculoFormacaoFormValues } from './curriculo-formacao-schema'

interface NivelIdiomaDrawerContentProps {
  fieldIndex: number
  onClose?: () => void
}

export function NivelIdiomaDrawerContent({
  fieldIndex,
  onClose,
}: NivelIdiomaDrawerContentProps) {
  const { setValue, watch } = useFormContext<CurriculoFormacaoFormValues>()
  const value = watch(`idiomas.${fieldIndex}.nivel`) ?? ''

  const handleSelect = (selected: string) => {
    setValue(`idiomas.${fieldIndex}.nivel`, selected, {
      shouldValidate: true,
    })
    onClose?.()
  }

  return (
    <div>
      <RadioList
        options={[...NIVEL_IDIOMA_OPCOES]}
        value={value}
        onValueChange={handleSelect}
        name={`nivel-idioma-${fieldIndex}`}
      />
    </div>
  )
}
