'use client'

import { updateUserGender } from '@/actions/update-user-gender'
import { InputField } from '@/components/ui/custom/input-field'
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
  const [otherValue, setOtherValue] = useState(
    currentGender && !GENDERS.includes(currentGender) ? currentGender : ''
  )
  const [isOtherSelected, setIsOtherSelected] = useState(
    currentGender ? !GENDERS.includes(currentGender) : false
  )
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (currentGender) {
      if (GENDERS.includes(currentGender)) {
        setSelectedGender(currentGender)
        setIsOtherSelected(false)
        setOtherValue('')
      } else {
        setSelectedGender('Outro')
        setIsOtherSelected(true)
        setOtherValue(currentGender)
      }
    }
  }, [currentGender])

  const handleGenderChange = async (gender: string) => {
    if (gender === 'Outro') {
      setIsOtherSelected(true)
      setSelectedGender('Outro')
      return
    }

    setIsOtherSelected(false)
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

  const handleOtherSubmit = async () => {
    if (!otherValue.trim()) {
      return
    }

    setIsLoading(true)
    try {
      const result = await updateUserGender(otherValue.trim())
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
      {isOtherSelected && (
        <div className="mt-4 space-y-2">
          <InputField
            placeholder="Digite seu gênero"
            value={otherValue}
            onChange={e => setOtherValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && otherValue.trim()) {
                handleOtherSubmit()
              }
            }}
            className="bg-card"
            showClearButton
            onClear={() => setOtherValue('')}
          />
          <button
            type="button"
            onClick={handleOtherSubmit}
            disabled={!otherValue.trim() || isLoading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar
          </button>
        </div>
      )}
    </div>
  )
}
