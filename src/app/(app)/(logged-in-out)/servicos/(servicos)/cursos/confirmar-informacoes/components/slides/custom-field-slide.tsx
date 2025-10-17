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

  const renderTextField = () => (
    <div className="space-y-2 overflow-y-auto">
      <Textarea
        {...register(fieldName)}
        placeholder="Escreva aqui ..."
        className="w-full border-0 min-h-[48px] mt-10 border-b border-border rounded-none shadow-none
         bg-transparent resize-none px-0 py-2 leading-[1.5]
         placeholder:text-muted-foreground
         focus-visible:ring-0 focus-visible:border-primary"
        rows={3}
      />
      {error && (
        <p className="text-destructive text-sm">{String(error.message)}</p>
      )}
    </div>
  )

  const renderRadioField = () => (
    <div className="space-y-4 mt-10">
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
      {error && (
        <p className="text-destructive text-sm">{String(error.message)}</p>
      )}
    </div>
  )

  const renderSelectField = () => (
    <div className="space-y-4 mt-10">
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
      {error && (
        <p className="text-destructive text-sm">{String(error.message)}</p>
      )}
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
      <div className="space-y-4 mt-10">
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
        {error && (
          <p className="text-destructive text-sm">{String(error.message)}</p>
        )}
      </div>
    )
  }

  return (
    <div className="w-full space-y-5">
      <div className="text-left pb-2">
        <h2 className="text-3xl font-medium text-foreground mb-2 leading-9 tracking-tight">
          {field.title}
        </h2>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-scroll scrollbar-hide">
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
    </div>
  )
}
