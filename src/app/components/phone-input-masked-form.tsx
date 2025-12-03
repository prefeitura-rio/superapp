'use client'

import type React from 'react'
import { useRef, useState } from 'react'

import { useInputValidation } from '@/hooks/useInputValidation'
import { formatPhoneNumber, isValidPhone } from '@/lib/phone-utils'
import { type CountryCode, getCountryCallingCode } from 'libphonenumber-js/max'
import { ActionDiv } from './action-div'
import { CountryCodeDrawerContent } from './drawer-contents/country-code-drawer-content'

interface PhoneInputMaskedFormProps {
  value: string
  onChange: (value: string) => void
  country: CountryCode
  onCountryChange: (value: CountryCode) => void
  onSubmit?: () => void
}

export default function PhoneInputMaskedForm({
  value,
  onChange,
  country,
  onCountryChange,
  onSubmit,
}: PhoneInputMaskedFormProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  const phoneState = useInputValidation({
    value,
    validate: phone => isValidPhone(phone, country),
    debounceMs: 500,
  })

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    // Only allow digits
    const digitsOnly = inputValue.replace(/\D/g, '')

    // Limit to 11 digits (Brazilian mobile)
    const limited = digitsOnly.slice(0, 11)

    // Format it for compatibility with the original component
    const formatted = formatPhoneNumber(limited, country)
    onChange(formatted)
  }

  const callingCode = `+${getCountryCallingCode(country)}`

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isValidPhone(value, country) && onSubmit) {
      // Close keyboard by blurring the active element
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
      onSubmit()
    }
  }

  // Create masked display value with bullet points
  const getMaskedValue = (): React.ReactNode => {
    // Remove all non-digit characters for processing
    const digits = value.replace(/\D/g, '')
    const parts: React.ReactNode[] = []
    const currentPosition = digits.length // Position of next bullet to be filled

    // Format: (XX) XXXXX-XXXX (11 digits total)
    parts.push(<span key="open-paren">(</span>)

    // First 2 digits (area code)
    for (let i = 0; i < 2; i++) {
      if (i < digits.length) {
        parts.push(
          <span key={`area-${i}`} className="text-foreground">
            {digits[i]}
          </span>
        )
      } else {
        // This is the active bullet if focused and it's the next position
        const isActiveBullet = isFocused && i === currentPosition
        parts.push(
          <span
            key={`area-bullet-${i}`}
            className={`inline-block w-1.5 h-1.5 rounded-full ${
              isActiveBullet
                ? 'animate-pulse-custom bg-muted-foreground'
                : 'bg-border'
            }`}
          />
        )
      }
    }

    parts.push(<span key="close-paren">)</span>)

    // Next 5 digits (first part of number)
    for (let i = 2; i < 7; i++) {
      if (i < digits.length) {
        parts.push(
          <span key={`middle-${i}`} className="text-foreground">
            {digits[i]}
          </span>
        )
      } else {
        const isActiveBullet = isFocused && i === currentPosition
        parts.push(
          <span
            key={`middle-bullet-${i}`}
            className={`inline-block w-1.5 h-1.5 rounded-full ${
              isActiveBullet
                ? 'animate-pulse-custom bg-muted-foreground'
                : 'bg-border'
            }`}
          />
        )
      }
    }

    parts.push(<span key="dash">-</span>)

    // Last 4 digits
    for (let i = 7; i < 11; i++) {
      if (i < digits.length) {
        parts.push(
          <span key={`last-${i}`} className="text-foreground">
            {digits[i]}
          </span>
        )
      } else {
        const isActiveBullet = isFocused && i === currentPosition
        parts.push(
          <span
            key={`last-bullet-${i}`}
            className={`inline-block w-1.5 h-1.5 rounded-full ${
              isActiveBullet
                ? 'animate-pulse-custom bg-muted-foreground'
                : 'bg-border'
            }`}
          />
        )
      }
    }

    return <div className="flex items-center gap-1.5">{parts}</div>
  }

  const handleMaskClick = () => {
    inputRef.current?.focus()
  }

  return (
    <>
      <form className="w-full flex flex-col gap-17" onSubmit={handleFormSubmit}>
        <div className="max-w-xl! mx-auto w-full flex row gap-8">
          <ActionDiv
            className={`w-19 bg-card ${callingCode && callingCode.length === 2 ? 'pl-7' : callingCode.length === 4 ? 'pl-4' : 'pl-5'}`}
            content={
              <span className="text-muted-foreground">{callingCode}</span>
            }
            drawerContent={
              <CountryCodeDrawerContent
                currentCountry={country}
                onCountrySelect={onCountryChange}
              />
            }
            drawerTitle="Selecione o país"
          />
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              id="phone"
              type="tel"
              inputMode="numeric"
              value={value.replace(/\D/g, '')}
              onChange={handlePhoneChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="absolute inset-0 opacity-0 w-full h-full z-10 cursor-text"
              maxLength={11}
            />
            <div
              onClick={handleMaskClick}
              className="flex-1 h-[72px] flex items-center text-base cursor-text"
            >
              {getMaskedValue()}
            </div>
          </div>
        </div>
        <span className="text-sm text-card-foreground mt-1 block text-left">
          Você receberá um código de verificação pelo WhatsApp para confirmar
          seu número
        </span>
      </form>
      <style jsx global>{`
        @keyframes pulse-bullet {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.6;
          }
        }
        .animate-pulse-custom {
          animation: pulse-bullet 1s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}
