'use client'

import { RadioList } from '@/components/ui/custom/radio-list'
import { useFormContext } from 'react-hook-form'
import type { CurriculoSituacaoFormValues } from './curriculo-situacao-schema'
import { useSituacaoApi } from './situacao-api-context'

interface SituacaoAtualDrawerContentProps {
  onClose?: () => void
}

export function SituacaoAtualDrawerContent({
  onClose,
}: SituacaoAtualDrawerContentProps) {
  const { setValue, watch } = useFormContext<CurriculoSituacaoFormValues>()
  const { situacoesAtual } = useSituacaoApi()
  const value = watch('idSituacao') ?? ''

  const options = situacoesAtual.map(item => ({
    label: item.descricao,
    value: item.id,
  }))

  const handleSelect = (selected: string) => {
    setValue('idSituacao', selected, { shouldValidate: true })
    onClose?.()
  }

  return (
    <div>
      <RadioList
        options={options}
        value={value}
        onValueChange={handleSelect}
        name="situacao-atual"
      />
    </div>
  )
}
