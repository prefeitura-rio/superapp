'use client'

import { updateUserFamilyIncome } from '@/actions/update-user-family-income'
import { RadioList } from '@/components/ui/custom/radio-list'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const FAMILY_INCOMES = [
  'Menos de 1 salário mínimo',
  '1 a 2 salários mínimos',
  '2 a 3 salários mínimos',
  '3 a 5 salários mínimos',
  'Mais de 5 salários mínimos',
]

interface FamilyIncomeDrawerContentProps {
  currentFamilyIncome?: string
  onClose?: () => void
}

export function FamilyIncomeDrawerContent({
  currentFamilyIncome,
  onClose,
}: FamilyIncomeDrawerContentProps) {
  const router = useRouter()
  const [selectedFamilyIncome, setSelectedFamilyIncome] = useState(
    currentFamilyIncome || ''
  )
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (currentFamilyIncome) {
      setSelectedFamilyIncome(currentFamilyIncome)
    }
  }, [currentFamilyIncome])

  const handleFamilyIncomeChange = async (familyIncome: string) => {
    setSelectedFamilyIncome(familyIncome)
    setIsLoading(true)
    try {
      const result = await updateUserFamilyIncome(familyIncome)
      if (result.success) {
        toast.success('Renda familiar atualizada com sucesso')
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
        options={FAMILY_INCOMES}
        value={selectedFamilyIncome}
        onValueChange={handleFamilyIncomeChange}
        disabled={isLoading}
        name="family-income"
      />
    </div>
  )
}
