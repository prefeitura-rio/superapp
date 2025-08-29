'use client'

import { Textarea } from '@/components/ui/textarea'
import { UseFormReturn } from 'react-hook-form'
import { CustomField } from '../../types'

interface CustomFieldSlideProps {
  field: CustomField
  fieldName: string
  form: UseFormReturn<any>
}

export function CustomFieldSlide({ field, fieldName, form }: CustomFieldSlideProps) {
  const { register, formState: { errors } } = form
  const error = errors[fieldName]

  return (
    <div className="w-full space-y-5">
      <div className="text-left">
        <h2 className="text-3xl font-medium text-foreground mb-2 leading-9 tracking-tight">
          {field.title}
        </h2>
      
      </div>

      <div className="space-y-4">
        {field.field_type === 'text' && (
          <div className="space-y-2">
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
              <p className="text-destructive text-sm">
                {String(error.message)}
              </p>
            )}
          </div>
        )}
        
        {/* Add support for other field types here in the future */}
        {field.field_type !== 'text' && (
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
