'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { RadioList } from '@/components/ui/custom/radio-list'
import { Textarea } from '@/components/ui/textarea'
import type { UseFormReturn } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import type { CustomField } from '../../types'

interface CustomFieldSlideProps {
  field: CustomField
  fieldName: string
  form: UseFormReturn<any>
}

export function CustomFieldSlide({
  field,
  fieldName,
  form,
}: CustomFieldSlideProps) {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = form
  const error = errors[fieldName]
  const watchedValue = watch(fieldName)

  const renderTextField = () => {
    const textValue = watchedValue || ''
    const characterCount = textValue.length
    const maxCharacters = 50

    return (
      <div className="space-y-2">
        <Textarea
          {...register(fieldName)}
          placeholder="Escreva aqui ..."
          className="w-full border-0 min-h-[48px] border-b border-border rounded-none shadow-none
           bg-transparent resize-none px-0 py-2 leading-[1.5]
           placeholder:text-muted-foreground
           focus-visible:ring-0 focus-visible:border-primary"
          rows={3}
          maxLength={maxCharacters}
        />
        <p className="text-muted-foreground text-sm">
          Limite de {maxCharacters} caracteres
        </p>
      </div>
    )
  }

  const renderRadioField = () => (
    <div className="space-y-4">
      <Controller
        name={fieldName}
        control={control}
        render={({ field: controllerField }) => (
          <RadioList
            options={
              field.options?.map(option => ({
                label: option.value,
                value: option.id,
              })) || []
            }
            value={controllerField.value}
            onValueChange={controllerField.onChange}
            name={fieldName}
            className="space-y-1"
          />
        )}
      />
    </div>
  )

  const renderSelectField = () => (
    <div className="space-y-4">
      <Controller
        name={fieldName}
        control={control}
        render={({ field: controllerField }) => (
          <RadioList
            options={
              field.options?.map(option => ({
                label: option.value,
                value: option.id,
              })) || []
            }
            value={controllerField.value}
            onValueChange={controllerField.onChange}
            name={fieldName}
            className="space-y-1"
          />
        )}
      />
    </div>
  )

  const renderMultiselectField = () => {
    const selectedValues = Array.isArray(watchedValue) ? watchedValue : []

    const toggleOption = (optionId: string) => {
      const currentValues = selectedValues
      const newValues = currentValues.includes(optionId)
        ? currentValues.filter(id => id !== optionId)
        : [...currentValues, optionId]
      setValue(fieldName, newValues)
    }

    return (
      <div className="space-y-4">
        <div className="space-y-1">
          {field.options?.map(option => (
            <div
              key={option.id}
              className="flex items-center justify-between cursor-pointer py-2 rounded-md transition-colors hover:bg-accent/40"
              onClick={() => toggleOption(option.id)}
            >
              <span className="text-foreground">{option.value}</span>
              <Checkbox
                checked={selectedValues.includes(option.id)}
                onCheckedChange={() => toggleOption(option.id)}
                className="size-6"
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const isLongTitle = field.title.length > 150

  return (
    <div className="w-full h-full flex flex-col">
      {/* Título com scroll próprio e altura máxima */}
      <div className="flex-shrink-0 pb-5" data-slide-title-container>
        <div className="max-h-[30vh] overflow-y-auto overflow-x-hidden pr-1">
          <h2 className={`font-medium text-foreground mb-2 tracking-tight break-words ${isLongTitle ? 'text-2xl leading-7' : 'text-3xl leading-9'}`}>
            {field.title}
          </h2>
        </div>
      </div>

      {/* Opções sempre visíveis - SEM scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-1">
        <div className="space-y-4">
          {field.field_type === 'text' && renderTextField()}
          {field.field_type === 'radio' && renderRadioField()}
          {field.field_type === 'select' && renderSelectField()}
          {field.field_type === 'multiselect' && renderMultiselectField()}

          {!['text', 'radio', 'select', 'multiselect'].includes(
            field.field_type
          ) && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Tipo de campo não suportado: {field.field_type}
              </p>
            </div>
          )}
        </div>

        {error && (
          <p className="text-destructive text-sm mt-2">
            {String(error.message)}
          </p>
        )}
      </div>
    </div>
  )
}
