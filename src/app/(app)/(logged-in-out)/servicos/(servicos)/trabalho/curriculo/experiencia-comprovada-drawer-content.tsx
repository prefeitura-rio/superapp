'use client'

import { RadioList } from '@/components/ui/custom/radio-list'
import { useFormContext } from 'react-hook-form'
import { SIM_NAO_OPCOES } from './constants'

interface ExperienciaComprovadaDrawerContentProps {
  fieldIndex: number
  onClose?: () => void
}

export function ExperienciaComprovadaDrawerContent({
  fieldIndex,
  onClose,
}: ExperienciaComprovadaDrawerContentProps) {
  const { setValue, watch } = useFormContext()
  const value =
    watch(`empregos.${fieldIndex}.experienciaComprovadaCarteira`) ?? ''

  const handleSelect = (selected: string) => {
    setValue(`empregos.${fieldIndex}.experienciaComprovadaCarteira`, selected, {
      shouldValidate: true,
    })
    onClose?.()
  }

  return (
    <div>
      <RadioList
        options={[...SIM_NAO_OPCOES]}
        value={value}
        onValueChange={handleSelect}
        name={`experiencia-comprovada-${fieldIndex}`}
      />
    </div>
  )
}
