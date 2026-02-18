'use client'

import { CheckboxList } from '@/components/ui/custom/checkbox-list'
import { useFormContext } from 'react-hook-form'

interface MultiplaSelecaoDrawerContentProps {
  fieldName: string
  opcoes: string[]
  onClose?: () => void
}

export function MultiplaSelecaoDrawerContent({
  fieldName,
  opcoes,
  onClose,
}: MultiplaSelecaoDrawerContentProps) {
  const { setValue, watch } = useFormContext()
  const value = (watch(fieldName) as string[]) ?? []

  const handleValueChange = (selected: string[]) => {
    setValue(fieldName, selected, { shouldValidate: true })
  }

  return (
    <div>
      <CheckboxList
        options={opcoes}
        value={value}
        onValueChange={handleValueChange}
        name={fieldName}
      />
    </div>
  )
}
