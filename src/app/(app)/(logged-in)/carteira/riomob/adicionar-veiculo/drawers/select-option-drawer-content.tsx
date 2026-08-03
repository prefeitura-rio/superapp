'use client'

import { RadioList } from '@/components/ui/custom/radio-list'

interface SelectOptionDrawerContentProps {
  options: string[] | { label: string; value: string }[]
  value?: string
  onSelect: (value: string) => void
  onClose?: () => void
  name?: string
}

export function SelectOptionDrawerContent({
  options,
  value,
  onSelect,
  onClose,
  name = 'select-option',
}: SelectOptionDrawerContentProps) {
  const handleChange = (nextValue: string) => {
    onSelect(nextValue)
    onClose?.()
  }

  return (
    <div>
      <RadioList
        options={options}
        value={value}
        onValueChange={handleChange}
        name={name}
      />
    </div>
  )
}
