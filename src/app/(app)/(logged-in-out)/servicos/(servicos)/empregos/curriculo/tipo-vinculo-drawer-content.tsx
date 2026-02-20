'use client'

import { CheckboxList } from '@/components/ui/custom/checkbox-list'
import { useFormContext } from 'react-hook-form'
import { useSituacaoApi } from './situacao-api-context'
import type { CurriculoSituacaoFormValues } from './curriculo-situacao-schema'

interface TipoVinculoDrawerContentProps {
  onClose?: () => void
}

export function TipoVinculoDrawerContent({
  onClose,
}: TipoVinculoDrawerContentProps) {
  const { setValue, watch } = useFormContext<CurriculoSituacaoFormValues>()
  const { regimesContratacao } = useSituacaoApi()
  const value = watch('idsTiposVinculo') ?? []

  const options = regimesContratacao.map((item) => ({
    label: item.descricao,
    value: item.id,
  }))

  const handleValueChange = (selected: string[]) => {
    setValue('idsTiposVinculo', selected, { shouldValidate: true })
  }

  return (
    <div>
      <CheckboxList
        options={options}
        value={value}
        onValueChange={handleValueChange}
        name="tipo-vinculo"
      />
    </div>
  )
}
