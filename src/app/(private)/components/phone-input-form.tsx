'use client'

import type React from 'react'

import { CustomInput } from '@/components/ui/custom/custom-input'
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

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')

    // If no digits, return empty string
    if (digits.length === 0) {
      return ''
    }

    // Format as (XX) XXXXX-XXXX
    if (digits.length <= 2) {
      return `(${digits}`
    }
    if (digits.length <= 7) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(
      7,
      11
    )}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // If user deletes the opening parenthesis, clear the entire field
    if (inputValue === '' || inputValue === '(') {
      onChange('')
      return
    }

    const formatted = formatPhoneNumber(inputValue)
    onChange(formatted)
  }

  return (
    <>
      <form className="w-full flex flex-col gap-4">
        <div className="w-full flex row gap-4">
          <ActionDiv
            className={`w-19 ${countryCode && countryCode.length === 4 ? 'pl-4.5' : 'pl-5.5'}`}
            content={
              <span className="text-card-foreground">
                {countryCode || '+55'}
              </span>
            }
            drawerContent={
              <CountryCodeDrawerContent
                currentCountryCode={countryCode || '+55'}
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
            placeholder="(21) 99999-9999"
            containerClassName="flex-1"
            className="w-full"
            maxLength={15}
          />
        </div>
        <span className="text-sm text-card-foreground mt-1 block text-left">
          Você irá receber um código via Whatsapp
        </span>
      </form>
    </>
  )
}
