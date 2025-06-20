'use client'

import { CustomInput } from '@/components/ui/custom/custom-input'
import { RadioList } from '@/components/ui/custom/radio-list'
import { COUNTRY_CODES } from '@/constants/country-codes'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'

interface CountryCodeDrawerContentProps {
  currentCountryCode?: string
  onCountryCodeSelect?: (countryCode: string) => void
  onClose?: () => void
}

export function CountryCodeDrawerContent({
  currentCountryCode,
  onCountryCodeSelect,
  onClose,
}: CountryCodeDrawerContentProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Normalize current country code for proper matching
  const normalizedCurrentCode = currentCountryCode?.startsWith('+')
    ? currentCountryCode
    : currentCountryCode
      ? `+${currentCountryCode}`
      : '+55'

  // Filter countries based on search query
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) {
      return COUNTRY_CODES
    }

    const normalizeString = (str: string) =>
      str
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '') // Remove accents
        .trim()

    const normalizedQuery = normalizeString(searchQuery)

    return COUNTRY_CODES.filter(country => {
      const normalizedName = normalizeString(country.name)
      const normalizedCode = country.code.replace('+', '')

      return (
        normalizedName.includes(normalizedQuery) ||
        normalizedCode.includes(normalizedQuery) ||
        country.code.includes(searchQuery)
      )
    })
  }, [searchQuery])

  // Format options for RadioList with unique keys
  const radioOptions = useMemo(() => {
    return filteredCountries.map(country => ({
      label: (
        <div className="flex items-center justify-between font-normal text-base w-full">
          <div className="flex items-center gap-3">
            <img
              src={`https://flagcdn.com/h20/${country.id}.png`}
              alt={`${country.name} flag`}
              className="w-6 h-4 object-cover flex-shrink-0 rounded-sm"
            />
            <span className="text-card-foreground">{country.name}</span>
          </div>
          <span className="text-muted-foreground ml-4">{country.code}</span>
        </div>
      ),
      value: country.code,
      key: country.id, // Use unique ID as key
    }))
  }, [filteredCountries])

  const handleCountryCodeChange = (code: string) => {
    onCountryCodeSelect?.(code)
    onClose?.()
  }

  return (
    <div className="py-2 -mb-2">
      <div className="mb-4">
        <CustomInput
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Pesquisar"
          className="w-full"
          leftIcon={<Search />}
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
            value={normalizedCurrentCode}
            onValueChange={handleCountryCodeChange}
            name="country-code"
          />
        )}
      </div>
    </div>
  )
}
