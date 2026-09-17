'use client'

import { updateUserBirthDate } from '@/actions/update-user-birth-date'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { DateInput } from '@/components/ui/custom/date-input'
import {
  type BirthDateFormData,
  birthDateFormSchema,
  minBirthDateInputValue,
  toDateInputValue,
  todayDateInputValue,
} from '@/lib/birth-date'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface BirthDateDrawerContentProps {
  currentBirthDate?: string
  onClose?: () => void
}

export function BirthDateDrawerContent({
  currentBirthDate,
  onClose,
}: BirthDateDrawerContentProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    reset,
    trigger,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<BirthDateFormData>({
    resolver: zodResolver(birthDateFormSchema),
    mode: 'onChange',
    defaultValues: {
      birthDate: toDateInputValue(currentBirthDate),
    },
  })

  const birthDate = watch('birthDate')

  useEffect(() => {
    reset({ birthDate: toDateInputValue(currentBirthDate) })
    void trigger()
  }, [currentBirthDate, reset, trigger])

  const onSubmit = async (data: BirthDateFormData) => {
    try {
      const result = await updateUserBirthDate(data.birthDate)
      if (result.success) {
        toast.success('Data de nascimento atualizada com sucesso')
        router.refresh()
        onClose?.()
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao atualizar data de nascimento'
      toast.error(message)
    }
  }

  return (
    <form
      className="flex flex-col gap-4 px-1 pb-2 pt-1"
      onSubmit={handleSubmit(onSubmit)}
    >
      <p className="text-sm text-muted-foreground">
        Informe sua data de nascimento.
      </p>

      <DateInput
        id="birth-date-input"
        min={minBirthDateInputValue()}
        max={todayDateInputValue()}
        disabled={isSubmitting}
        error={errors.birthDate?.message}
        {...register('birthDate')}
        value={birthDate}
      />

      <CustomButton
        type="submit"
        size="lg"
        fullWidth
        variant="primary"
        loading={isSubmitting}
        disabled={!isValid || isSubmitting}
      >
        Salvar
      </CustomButton>
    </form>
  )
}
