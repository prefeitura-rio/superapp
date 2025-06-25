import { COUNTRY_CODES } from '@/constants/country-codes'

// Enhanced country data with phone formatting info
interface CountryPhoneFormat {
  code: string
  format: string // Format pattern using X for digits
  minLength: number
  maxLength: number
  placeholder: string
}

export function getPhoneFormatForCountry(
  countryCode: string
): CountryPhoneFormat {
  const country = COUNTRY_CODES.find(c => c.code === countryCode)

  if (country) {
    return {
      code: country.code,
      format: country.phoneFormat,
      minLength: country.minLength,
      maxLength: country.maxLength,
      placeholder: country.placeholder,
    }
  }

  // Default to Brazil if country not found
  const brazilCountry = COUNTRY_CODES.find(c => c.code === '+55')!
  return {
    code: brazilCountry.code,
    format: brazilCountry.phoneFormat,
    minLength: brazilCountry.minLength,
    maxLength: brazilCountry.maxLength,
    placeholder: brazilCountry.placeholder,
  }
}

export function formatPhoneNumber(value: string, countryCode: string): string {
  const format = getPhoneFormatForCountry(countryCode)

  // Remove all non-digits
  const digits = value.replace(/\D/g, '')

  // If no digits, return empty string
  if (digits.length === 0) {
    return ''
  }

  // Limit digits to maxLength for the country
  const limitedDigits = digits.substring(0, format.maxLength)

  // Apply formatting based on country format
  let formatted = ''
  let digitIndex = 0

  // First, apply the format pattern
  for (
    let i = 0;
    i < format.format.length && digitIndex < limitedDigits.length;
    i++
  ) {
    const char = format.format[i]
    if (char === 'X') {
      formatted += limitedDigits[digitIndex]
      digitIndex++
    } else {
      formatted += char
    }
  }

  // If there are remaining digits after the format pattern is exhausted,
  // append them with a space separator
  if (digitIndex < limitedDigits.length) {
    if (formatted.length > 0 && !formatted.endsWith(' ')) {
      formatted += ' '
    }
    formatted += limitedDigits.substring(digitIndex)
  }

  return formatted
}

export function isValidPhoneLength(
  phoneNumber: string,
  countryCode: string
): boolean {
  const format = getPhoneFormatForCountry(countryCode)
  const digits = phoneNumber.replace(/\D/g, '')
  return digits.length >= format.minLength && digits.length <= format.maxLength
}

export function getPhonePlaceholder(countryCode: string): string {
  const format = getPhoneFormatForCountry(countryCode)
  return format.placeholder
}
