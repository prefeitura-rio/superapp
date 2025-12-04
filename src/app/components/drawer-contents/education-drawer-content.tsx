'use client'

import { updateUserEducation } from '@/actions/update-user-education'
import { RadioList } from '@/components/ui/custom/radio-list'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const EDUCATIONS = [
  'Fundamental incompleto',
  'Fundamental completo',
  'Médio incompleto',
  'Médio completo',
  'Superior incompleto',
  'Superior completo',
  'Pós Graduação',
  'Mestrado',
  'Doutorado',
]

interface EducationDrawerContentProps {
  currentEducation?: string
  onClose?: () => void
}

export function EducationDrawerContent({
  currentEducation,
  onClose,
}: EducationDrawerContentProps) {
  const router = useRouter()
  const [selectedEducation, setSelectedEducation] = useState(
    currentEducation || ''
  )
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (currentEducation) {
      setSelectedEducation(currentEducation)
    }
  }, [currentEducation])

  const handleEducationChange = async (education: string) => {
    setSelectedEducation(education)
    setIsLoading(true)
    try {
      const result = await updateUserEducation(education)
      if (result.success) {
        toast.success('Escolaridade atualizada com sucesso')
        onClose?.()
      }
    } catch (error: any) {
      router.push('/sessao-expirada')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="">
      <RadioList
        options={EDUCATIONS}
        value={selectedEducation}
        onValueChange={handleEducationChange}
        disabled={isLoading}
        name="education"
      />
    </div>
  )
}
