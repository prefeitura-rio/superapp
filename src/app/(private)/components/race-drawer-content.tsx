'use client'

import { updateUserEthnicity } from '@/actions/update-user-ethnicity'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { RACE_API_TO_DISPLAY } from '@/lib/format-race'
import { useEffect, useState } from 'react'

const RACES = ['Branca', 'Preta', 'Parda', 'Amarela', 'Indígena', 'Outra']

interface RaceDrawerContentProps {
  currentRace?: string
  onClose?: () => void
}

export function RaceDrawerContent({
  currentRace,
  onClose,
}: RaceDrawerContentProps) {
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
        console.log('Etnia atualizada com sucesso:', result.message)
        onClose?.()
      } else {
        console.error('Falha ao atualizar etnia:', result.message)
      }
    } catch (error) {
      console.log('Erro ao atualizar etnia:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="py-2 -mb-2">
      <RadioGroup
        className="space-y-1"
        value={selectedRace}
        onValueChange={handleRaceChange}
        disabled={isLoading}
      >
        {RACES.map(race => (
          <label
            key={race}
            className={`flex items-center justify-between cursor-pointer px-2 py-2 rounded-md transition-colors hover:bg-accent/40 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            htmlFor={`race-${race}`}
          >
            <span>{race}</span>
            <RadioGroupItem
              id={`race-${race}`}
              value={race}
              disabled={isLoading}
            />
          </label>
        ))}
      </RadioGroup>
    </div>
  )
}
