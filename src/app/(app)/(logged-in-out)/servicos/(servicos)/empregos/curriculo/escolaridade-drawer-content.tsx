'use client'

import { updateUserEducation } from '@/actions/update-user-education'
import { EDUCATIONS } from '@/app/components/drawer-contents/education-drawer-content'
import { RadioList } from '@/components/ui/custom/radio-list'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useFormContext } from 'react-hook-form'
import type { CurriculoFormacaoFormValues } from './curriculo-formacao-schema'

interface EscolaridadeDrawerContentProps {
  onClose?: () => void
}

/** Escolaridade compartilhada com Informações Pessoais; atualiza via server action. */
export function EscolaridadeDrawerContent({
  onClose,
}: EscolaridadeDrawerContentProps) {
  const router = useRouter()
  const { setValue, watch } = useFormContext<CurriculoFormacaoFormValues>()
  const value = watch('escolaridade') ?? ''
  const [isLoading, setLoading] = useState(false)

  const handleSelect = async (selected: string) => {
    setLoading(true)
    try {
      const result = await updateUserEducation(selected)
      if (result.success) {
        setValue('escolaridade', selected, { shouldValidate: true })
        toast.success('Escolaridade atualizada com sucesso')
        onClose?.()
      }
    } catch {
      router.push('/sessao-expirada')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <RadioList
        options={EDUCATIONS}
        value={value}
        onValueChange={handleSelect}
        disabled={isLoading}
        name="escolaridade"
      />
    </div>
  )
}
