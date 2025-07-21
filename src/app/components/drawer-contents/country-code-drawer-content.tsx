'use client'

import { CustomInput } from '@/components/ui/custom/custom-input'
import { RadioList } from '@/components/ui/custom/radio-list'
import { getCountryOptions } from '@/lib/phone-utils'
import type { CountryCode } from 'libphonenumber-js/max'
import { Search } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

interface CountryCodeDrawerContentProps {
  currentCountry: CountryCode
  onCountrySelect: (countryCode: CountryCode) => void
  onClose?: () => void
}

const countryOptions = getCountryOptions()

export function CountryCodeDrawerContent({
  currentCountry,
  onCountrySelect,
  onClose,
}: CountryCodeDrawerContentProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const handleImageError = useCallback((countryId: string) => {
    setImageErrors(prev => ({ ...prev, [countryId]: true }))
  }, [])

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) {
      return countryOptions
    }

    const normalizeString = (str: string) =>
      str
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .trim()

    const normalizedQuery = normalizeString(searchQuery)

    return countryOptions.filter(country => {
      const normalizedName = normalizeString(country.name)
      const normalizedCode = country.code.replace('+', '')

      return (
        normalizedName.includes(normalizedQuery) ||
        normalizedCode.includes(normalizedQuery) ||
        country.code.includes(searchQuery)
      )
    })
  }, [searchQuery])

  const radioOptions = useMemo(() => {
    return filteredCountries.map(country => ({
      label: (
        <div className="flex items-center justify-between font-normal text-base w-full">
          <div className="flex items-center gap-3">
            {imageErrors[country.id] ? (
              <div className="w-6 h-4 bg-muted rounded-sm flex-shrink-0" />
            ) : (
              <img
                src={`https://flagcdn.com/h20/${country.id.toLowerCase()}.png`}
                alt={`${country.name} flag`}
                className="w-6 h-4 object-cover flex-shrink-0 rounded-sm"
                onError={() => handleImageError(country.id)}
              />
            )}
            <span className="text-card-foreground">{country.name}</span>
          </div>
          <span className="text-muted-foreground ml-4">{country.code}</span>
        </div>
      ),
      value: country.id,
      key: country.id,
    }))
  }, [filteredCountries, imageErrors, handleImageError])

  const handleCountrySelect = (code: string) => {
    onCountrySelect(code as CountryCode)
    onClose?.()
  }

  return (
    <div className="py-5 -mb-2">
      <div className="mb-4">
        <CustomInput
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Pesquisar"
          className="w-full bg-card"
          leftIcon={<Search className="text-card-foreground" />}
        />
      </div>

      <div className="max-h-80 overflow-y-auto">
        {filteredCountries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum país encontrado</p>
          </div>
        ) : (
          <RadioList
            options={radioOptions}
            value={currentCountry}
            onValueChange={handleCountrySelect}
            name="country-code"
          />
        )}
      </div>
    </div>
  )
}
