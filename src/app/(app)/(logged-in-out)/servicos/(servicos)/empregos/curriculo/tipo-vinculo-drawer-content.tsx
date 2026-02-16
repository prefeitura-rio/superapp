'use client'

import { CheckboxList } from '@/components/ui/custom/checkbox-list'
import { useFormContext } from 'react-hook-form'
import { TIPO_VINCULO_OPCOES } from './constants'
import type { CurriculoSituacaoFormValues } from './curriculo-situacao-schema'

interface TipoVinculoDrawerContentProps {
  onClose?: () => void
}

export function TipoVinculoDrawerContent({
  onClose,
}: TipoVinculoDrawerContentProps) {
  const { setValue, watch } = useFormContext<CurriculoSituacaoFormValues>()
  const value = watch('tipoVinculo') ?? []

  const handleValueChange = (selected: string[]) => {
    setValue('tipoVinculo', selected, { shouldValidate: true })
  }

  return (
    <div>
      <CheckboxList
        options={[...TIPO_VINCULO_OPCOES]}
        value={value}
        onValueChange={handleValueChange}
        name="tipo-vinculo"
      />
    </div>
  )
}
