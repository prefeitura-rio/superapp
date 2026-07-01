'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { RadioList } from '@/components/ui/custom/radio-list'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { applyMask } from '@/lib/input-mask'
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

  const MASKED_FORMATS = ['cpf', 'phone', 'cep', 'date', 'number'] as const
  const PLACEHOLDER: Record<string, string> = {
    cpf: '000.000.000-00',
    phone: '(00) 00000-0000',
    cep: '00000-000',
    date: 'DD/MM/AAAA',
    number: 'Somente números',
  }

  const inputClassName =
    'w-full border-0 border-b border-border rounded-none shadow-none ' +
    'bg-transparent px-0 py-2 h-auto ' +
    'placeholder:text-muted-foreground ' +
    'focus-visible:ring-0 focus-visible:border-primary'

  const renderTextField = () => {
    const fmt = field.format_type ?? 'free'

    if (fmt === 'email') {
      return (
        <Input
          {...register(fieldName)}
          type="email"
          inputMode="email"
          placeholder="exemplo@email.com"
          className={inputClassName}
          enterKeyHint="next"
        />
      )
    }

    if ((MASKED_FORMATS as readonly string[]).includes(fmt)) {
      return (
        <Controller
          name={fieldName}
          control={control}
          render={({ field: ctrl }) => (
            <Input
              value={ctrl.value || ''}
              onChange={e => ctrl.onChange(applyMask(e.target.value, fmt))}
              inputMode={fmt === 'number' ? 'numeric' : 'tel'}
              placeholder={PLACEHOLDER[fmt] ?? ''}
              className={inputClassName}
              enterKeyHint="next"
            />
          )}
        />
      )
    }

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
          maxLength={50}
          enterKeyHint="next"
        />
        <p className="text-muted-foreground text-sm">Limite de 50 caracteres</p>
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
          <h2
            className={`font-medium text-foreground mb-2 tracking-tight break-words ${isLongTitle ? 'text-2xl leading-7' : 'text-3xl leading-9'}`}
          >
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
