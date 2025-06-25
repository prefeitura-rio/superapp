import examples from 'libphonenumber-js/examples.mobile.json'
import {
  AsYouType,
  type CountryCode,
  getCountries,
  getCountryCallingCode,
  getExampleNumber,
  isValidPhoneNumber,
  parsePhoneNumber,
} from 'libphonenumber-js/max'

export function getCountryOptions() {
  const countries = getCountries()
  const displayNames = new Intl.DisplayNames(['pt-BR'], { type: 'region' })

  const countryOptions = countries
    .map(country => {
      try {
        const callingCode = getCountryCallingCode(country)
        const name = displayNames.of(country)
        if (name && name !== country) {
          return {
            id: country,
            name,
            code: `+${callingCode}`,
          }
        }
      } catch (e) {
        return null
      }
      return null
    })
    .filter(
      (country): country is { id: CountryCode; name: string; code: string } =>
        Boolean(country)
    )
    .sort((a, b) => a.name.localeCompare(b.name))

  const brazilIndex = countryOptions.findIndex(c => c.id === 'BR')
  if (brazilIndex > -1) {
    const brazil = countryOptions.splice(brazilIndex, 1)[0]
    countryOptions.unshift(brazil)
  }

  return countryOptions
}

export function formatPhoneNumber(value: string, country: CountryCode): string {
  if (!value) return ''
  return new AsYouType(country).input(value)
}

export function isValidPhone(
  phoneNumber: string,
  country: CountryCode
): boolean {
  return isValidPhoneNumber(phoneNumber, country)
}

export function getPhonePlaceholder(country: CountryCode): string {
  try {
    const example = getExampleNumber(country, examples)
    return example ? example.formatNational() : ''
  } catch (error) {
    return ''
  }
}

export function parsePhoneNumberForApi(
  phoneNumber: string,
  country: CountryCode
) {
  try {
    const parsed = parsePhoneNumber(phoneNumber, country)
    if (!parsed) return null

    const ddi = parsed.countryCallingCode
    let ddd = ''
    let valor = parsed.nationalNumber as string

    if (parsed.country === 'BR' && parsed.nationalNumber) {
      const nationalNumber = parsed.nationalNumber
      if (nationalNumber.length >= 10) {
        ddd = nationalNumber.substring(0, 2)
        valor = nationalNumber.substring(2)
      }
    }

    return { ddi, ddd, valor }
  } catch (error) {
    return null
  }
}
