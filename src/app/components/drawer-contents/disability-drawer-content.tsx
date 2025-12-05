'use client'

import { updateUserDisability } from '@/actions/update-user-disability'
import { RadioList } from '@/components/ui/custom/radio-list'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const DISABILITIES = [
  'Não sou pessoa com deficiência',
  'Física',
  'Auditiva',
  'Visual',
  'Transtorno do Espectro Autista',
  'Intelectual',
  'Mental (psicossocial)',
  'Reabilitado do INSS',
]

interface DisabilityDrawerContentProps {
  currentDisability?: string
  onClose?: () => void
}

export function DisabilityDrawerContent({
  currentDisability,
  onClose,
}: DisabilityDrawerContentProps) {
  const router = useRouter()
  const [selectedDisability, setSelectedDisability] = useState(
    currentDisability || ''
  )
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (currentDisability) {
      setSelectedDisability(currentDisability)
    }
  }, [currentDisability])

  const handleDisabilityChange = async (disability: string) => {
    setSelectedDisability(disability)
    setIsLoading(true)
    try {
      const result = await updateUserDisability(disability)
      if (result.success) {
        toast.success('Deficiência atualizada com sucesso')
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
        options={DISABILITIES}
        value={selectedDisability}
        onValueChange={handleDisabilityChange}
        disabled={isLoading}
        name="disability"
      />
    </div>
  )
}
