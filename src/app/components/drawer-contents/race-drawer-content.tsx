'use client'

import { updateUserEthnicity } from '@/actions/update-user-ethnicity'
import { RadioList } from '@/components/ui/custom/radio-list'
import { RACE_API_TO_DISPLAY } from '@/lib/format-race'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const RACES = ['Branca', 'Preta', 'Parda', 'Amarela', 'Indígena', 'Outra']

interface RaceDrawerContentProps {
  currentRace?: string
  onClose?: () => void
}

export function RaceDrawerContent({
  currentRace,
  onClose,
}: RaceDrawerContentProps) {
  const router = useRouter()
  
  // Map API value to display value for initial selection
  const initialDisplayRace =
    currentRace && RACE_API_TO_DISPLAY[currentRace.toLowerCase()]
      ? RACE_API_TO_DISPLAY[currentRace.toLowerCase()]
      : ''
  const [selectedRace, setSelectedRace] = useState(initialDisplayRace)
  const [isLoading, setIsLoading] = useState(false)

  // If currentRace changes while open, update selectedRace
  useEffect(() => {
    const mapped =
      currentRace && RACE_API_TO_DISPLAY[currentRace.toLowerCase()]
        ? RACE_API_TO_DISPLAY[currentRace.toLowerCase()]
        : ''
    setSelectedRace(mapped)
  }, [currentRace])

  const handleRaceChange = async (race: string) => {
    setSelectedRace(race)
    setIsLoading(true)
    try {
      const valueToSend = race
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
      const result = await updateUserEthnicity(valueToSend)
      if (result.success) {
        toast.success('Cor / Raça atualizada com sucesso')
        onClose?.()
      }
    } catch (error: any) {
      // Redirect to session expired page on any error
      router.push('/sessao-expirada')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="">
      <RadioList
        options={RACES}
        value={selectedRace}
        onValueChange={handleRaceChange}
        disabled={isLoading}
        name="race"
      />
    </div>
  )
}
