'use client'

import type React from 'react'

import { CustomInput } from '@/components/ui/custom/custom-input'
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
            className={`w-19 ${currentCountryCode && currentCountryCode.length === 2 ? 'pl-7' : currentCountryCode.length === 4 ? 'pl-4' : 'pl-5'}`}
            content={
              <span className="text-card-foreground">{currentCountryCode}</span>
            }
            drawerContent={
              <CountryCodeDrawerContent
                currentCountryCode={currentCountryCode}
                onCountryCodeSelect={onCountryCodeChange}
              />
            }
            drawerTitle="Selecionar código do país"
          />
          <CustomInput
            id="phone"
            type="text"
            value={value}
            onChange={handlePhoneChange}
            placeholder={getPhonePlaceholder(currentCountryCode)}
            containerClassName="flex-1"
            className="w-full"
          />
        </div>
        <span className="text-sm text-card-foreground mt-1 block text-left">
          Você irá receber um código via Whatsapp
        </span>
      </form>
    </>
  )
}
