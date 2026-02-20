'use client'

import { RadioList } from '@/components/ui/custom/radio-list'
import { useFormContext } from 'react-hook-form'
import type { CurriculoSituacaoFormValues } from './curriculo-situacao-schema'
import { useSituacaoApi } from './situacao-api-context'

interface DisponibilidadeDrawerContentProps {
  onClose?: () => void
}

export function DisponibilidadeDrawerContent({
  onClose,
}: DisponibilidadeDrawerContentProps) {
  const { setValue, watch } = useFormContext<CurriculoSituacaoFormValues>()
  const { disponibilidades } = useSituacaoApi()
  const value = watch('idDisponibilidade') ?? ''

  const options = disponibilidades.map(item => ({
    label: item.descricao,
    value: item.id,
  }))

  const handleSelect = (selected: string) => {
    setValue('idDisponibilidade', selected, { shouldValidate: true })
    onClose?.()
  }

  return (
    <div>
      <RadioList
        options={options}
        value={value}
        onValueChange={handleSelect}
        name="disponibilidade"
      />
    </div>
  )
}
