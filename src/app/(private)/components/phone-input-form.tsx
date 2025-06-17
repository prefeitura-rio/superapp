'use client'

import type React from 'react'

import { Input } from '@/components/ui/input'
import { useState } from 'react'

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

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    // Always start with '+'
    if (!value.startsWith('+')) {
      value = `+${value.replace(/[^\d]/g, '')}`
    } else {
      value = `+${value.slice(1).replace(/[^\d]/g, '')}`
    }
    // Prevent removing the '+'
    if (value === '+') {
      if (onCountryCodeChange) onCountryCodeChange('')
      return
    }
    if (onCountryCodeChange) onCountryCodeChange(value)
  }

  return (
    <>
      <form className="w-full flex flex-col gap-4">
        <div className="w-full flex row gap-4">
          <Input
            id="country-code"
            type="text"
            value={
              countryCode
                ? countryCode.startsWith('+')
                  ? countryCode
                  : `+${countryCode}`
                : ''
            }
            onChange={handleCountryCodeChange}
            placeholder="+55"
            className={`w-19 ${
              countryCode && countryCode.length === 4 ? 'pl-4.5' : 'pl-5.5'
            } bg-card border-border rounded-xl`}
            maxLength={4}
            // Prevent cursor before '+'
            onKeyDown={e => {
              // Prevent deleting or moving before the '+'
              if (
                e.currentTarget.selectionStart === 0 &&
                (e.key === 'Backspace' ||
                  e.key === 'Delete' ||
                  e.key === 'ArrowLeft')
              ) {
                e.preventDefault()
              }
            }}
          />
          <Input
            id="phone"
            type="text"
            value={value}
            onChange={handlePhoneChange}
            placeholder="(21) 99999-9999"
            className="flex-1 bg-card border-border rounded-xl"
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
