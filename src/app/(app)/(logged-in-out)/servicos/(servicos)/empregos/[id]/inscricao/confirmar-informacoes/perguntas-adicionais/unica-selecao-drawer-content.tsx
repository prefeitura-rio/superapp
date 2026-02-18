'use client'

import { RadioList } from '@/components/ui/custom/radio-list'
import { useFormContext } from 'react-hook-form'

interface UnicaSelecaoDrawerContentProps {
  fieldName: string
  opcoes: string[]
  onClose?: () => void
}

export function UnicaSelecaoDrawerContent({
  fieldName,
  opcoes,
  onClose,
}: UnicaSelecaoDrawerContentProps) {
  const { setValue, watch } = useFormContext()
  const value = watch(fieldName) ?? ''

  const handleValueChange = (selected: string) => {
    setValue(fieldName, selected, { shouldValidate: true })
    // Fechar o drawer após selecionar
    setTimeout(() => {
      onClose?.()
    }, 300)
  }

  return (
    <div>
      <RadioList
        options={opcoes}
        value={value}
        onValueChange={handleValueChange}
        name={fieldName}
      />
    </div>
  )
}
