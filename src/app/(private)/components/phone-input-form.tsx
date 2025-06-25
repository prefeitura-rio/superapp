'use client'

import type React from 'react'

import { InputField } from '@/components/ui/custom/input-field'
import { useInputValidation } from '@/hooks/useInputValidation'
import {
  formatPhoneNumber,
  getPhonePlaceholder,
  isValidPhone,
} from '@/lib/phone-utils'
import { type CountryCode, getCountryCallingCode } from 'libphonenumber-js/max'
import { ActionDiv } from './action-div'
import { CountryCodeDrawerContent } from './country-code-drawer-content'

interface PhoneInputFormProps {
  value: string
  onChange: (value: string) => void
  country: CountryCode
  onCountryChange: (value: CountryCode) => void
}

export default function PhoneInputForm({
  value,
  onChange,
  country,
  onCountryChange,
}: PhoneInputFormProps) {
  const phoneState = useInputValidation({
    value,
    validate: phone => isValidPhone(phone, country),
    debounceMs: 500,
  })

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // Prevent adding more characters if the number is already valid
    if (isValidPhone(value, country) && inputValue.length > value.length) {
      return
    }

    const formatted = formatPhoneNumber(inputValue, country)
    onChange(formatted)
  }

  const callingCode = `+${getCountryCallingCode(country)}`

  return (
    <>
      <form className="w-full flex flex-col gap-4">
        <div className="w-full flex row gap-4">
          <ActionDiv
            className={`w-19 bg-card border-border ${callingCode && callingCode.length === 2 ? 'pl-7' : callingCode.length === 4 ? 'pl-4' : 'pl-5'}`}
            content={
              <span className="text-muted-foreground">{callingCode}</span>
            }
            drawerContent={
              <CountryCodeDrawerContent
                currentCountry={country}
                onCountrySelect={onCountryChange}
              />
            }
            drawerTitle="Selecionar código do país"
          />
          <InputField
            id="phone"
            type="tel"
            value={value}
            onChange={handlePhoneChange}
            className="flex-1 bg-card border-border rounded-xl"
            showClearButton
            onClear={() => onChange('')}
            state={phoneState}
            placeholder={getPhonePlaceholder(country)}
          />
        </div>
        <span className="text-sm text-card-foreground mt-1 block text-left">
          Você irá receber um código via Whatsapp
        </span>
      </form>
    </>
  )
}
