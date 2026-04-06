'use client'

import { RadioList } from '@/components/ui/custom/radio-list'
import { useFormContext } from 'react-hook-form'
import type { CurriculoFormacaoFormValues } from './curriculo-formacao-schema'
import { useFormacaoApi } from './formacao-api-context'
import { getSelectedLanguageIds } from './utils/language-duplicate-detection'

interface IdiomaDrawerContentProps {
  fieldIndex: number
  onClose?: () => void
}

export function IdiomaDrawerContent({
  fieldIndex,
  onClose,
}: IdiomaDrawerContentProps) {
  const { setValue, watch } = useFormContext<CurriculoFormacaoFormValues>()
  const { idiomas, isLoading } = useFormacaoApi()
  const value = watch(`idiomas.${fieldIndex}.idIdioma`) ?? ''

  // Get all selected languages except current field
  const allIdiomas = watch('idiomas')
  const selectedLanguageIds = getSelectedLanguageIds(allIdiomas, fieldIndex)

  // Transform options to include disabled state for already-selected languages
  const options = idiomas.map(item => {
    const isAlreadySelected = selectedLanguageIds.has(item.id)
    return {
      label: isAlreadySelected
        ? `${item.descricao} (já adicionado)`
        : item.descricao,
      value: item.id,
      disabled: isAlreadySelected,
    }
  })

  const handleSelect = (selected: string) => {
    setValue(`idiomas.${fieldIndex}.idIdioma`, selected, {
      shouldValidate: true,
    })
    onClose?.()
  }

  if (isLoading) {
    return (
      <div className="py-4 text-center text-muted-foreground text-sm">
        Carregando opções...
      </div>
    )
  }

  return (
    <div>
      <RadioList
        options={options}
        value={value}
        onValueChange={handleSelect}
        name={`idioma-${fieldIndex}`}
      />
    </div>
  )
}
