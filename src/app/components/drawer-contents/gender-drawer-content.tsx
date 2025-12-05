'use client'

import { updateUserGender } from '@/actions/update-user-gender'
import { RadioList } from '@/components/ui/custom/radio-list'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const GENDERS = [
  'Homem cisgênero',
  'Homem transgênero',
  'Mulher cisgênero',
  'Mulher transgênero',
  'Não binário',
  'Prefiro não informar',
  'Outro',
]

interface GenderDrawerContentProps {
  currentGender?: string
  onClose?: () => void
}

export function GenderDrawerContent({
  currentGender,
  onClose,
}: GenderDrawerContentProps) {
  const router = useRouter()
  const [selectedGender, setSelectedGender] = useState(
    currentGender && GENDERS.includes(currentGender) ? currentGender : ''
  )
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (currentGender) {
      if (GENDERS.includes(currentGender)) {
        setSelectedGender(currentGender)
      } else {
        setSelectedGender('Outro')
      }
    }
  }, [currentGender])

  const handleGenderChange = async (gender: string) => {
    setSelectedGender(gender)
    setIsLoading(true)
    try {
      const result = await updateUserGender(gender)
      if (result.success) {
        toast.success('Gênero atualizado com sucesso')
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
        options={GENDERS}
        value={selectedGender}
        onValueChange={handleGenderChange}
        disabled={isLoading}
        name="gender"
      />
    </div>
  )
}
