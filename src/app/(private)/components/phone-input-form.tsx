'use client'

import type React from 'react'

import { useInputValidation } from '@/hooks/useInputValidation'
import { InputField } from '../../../components/ui/custom/input-field'

import {
  formatPhoneNumber,
  getPhonePlaceholder,
} from '@/lib/format-phone-worldwide'
import { useState } from 'react'
import { ActionDiv } from './action-div'
import { CountryCodeDrawerContent } from './country-code-drawer-content'

interface PhoneInputFormProps {
  value: string
  onChange: (value: string) => void
  countryCode?: string
  onCountryCodeChange?: (value: string) => void
}

export default function PhoneInputForm({
  value,
  onChange,
  countryCode,
  onCountryCodeChange,
}: PhoneInputFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  //
  const isValidPhone = (formattedPhone: string) => {
    const digitsOnly = formattedPhone.replace(/\D/g, '')
    return digitsOnly.length === 11
  }

  const phoneState = useInputValidation({
    value,
    validate: isValidPhone,
    debounceMs: 500,
    minLength: 11,
  })

  const currentCountryCode = countryCode || '+55'

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // If user deletes everything, clear the field
    if (inputValue === '') {
      onChange('')
      return
    }

    // Format based on selected country
    const formatted = formatPhoneNumber(inputValue, currentCountryCode)
    onChange(formatted)
  }

  return (
    <>
      <form className="w-full flex flex-col gap-4">
        <div className="w-full flex row gap-4">
          <ActionDiv
            className={`w-19 bg-card border-border ${currentCountryCode && currentCountryCode.length === 2 ? 'pl-7' : currentCountryCode.length === 4 ? 'pl-4' : 'pl-5'}`}
            content={
              <span className="text-muted-foreground">
                {currentCountryCode}
              </span>
            }
            drawerContent={
              <CountryCodeDrawerContent
                currentCountryCode={currentCountryCode}
                onCountryCodeSelect={onCountryCodeChange}
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
            maxLength={15}
            showClearButton
            onClear={() => onChange('')}
            state={phoneState}
            placeholder={getPhonePlaceholder(currentCountryCode)}
          />
        </div>
        <span className="text-sm text-card-foreground mt-1 block text-left">
          Você irá receber um código via Whatsapp
        </span>
      </form>
    </>
  )
}
