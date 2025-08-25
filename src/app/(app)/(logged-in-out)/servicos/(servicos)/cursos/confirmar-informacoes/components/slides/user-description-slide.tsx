import { Textarea } from '@/components/ui/textarea'
import type { UseFormReturn } from 'react-hook-form'
import type { InscriptionFormData } from '../../types'

interface UserDescriptionSlideProps {
  form: UseFormReturn<InscriptionFormData>
  fieldName: keyof InscriptionFormData
}

export const UserDescriptionSlide = ({
  form,
  fieldName,
}: UserDescriptionSlideProps) => {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <div className="w-full space-y-9">
      <div className="text-left">
        <h2 className="text-3xl font-medium text-foreground mb-2 leading-9 tracking-tight">
          <span className="text-primary">Fale um pouco sobre você</span> e por
          que quer fazer este curso
        </h2>
      </div>

      <div className="">
        <div>
          <Textarea
            {...register(fieldName as any)}
            placeholder="Escreva aqui ..."
            className="w-full border-0 min-h-[48px] border-b border-border rounded-none shadow-none
             bg-transparent resize-none px-0 py-2 leading-[1.5]
             placeholder:text-muted-foreground
             focus-visible:ring-0 focus-visible:border-primary"
          />

          {errors[fieldName as keyof typeof errors] && (
            <p className="text-destructive text-sm mt-2">
              {errors[fieldName as keyof typeof errors]?.message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
