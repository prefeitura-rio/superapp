export interface PhoneData {
  principal?: {
    ddi?: string | null
    ddd?: string | null
    valor?: string | null
  } | null
}

// Validations for non-empty phones in user data

export function hasValidPhone(phone: PhoneData | null | undefined): boolean {
  // Null/undefined
  if (!phone) {
    return false
  }

  // Object with structure - all three fields must be present and non-empty
  const principal = phone.principal
  if (!principal) {
    return false
  }

  const { ddi, ddd, valor } = principal

  // Check if any value is the string "null" or empty
  const isNullString = (val: string | null | undefined) =>
    val === 'null' || val === null || val === undefined

  return (
    typeof ddi === 'string' &&
    !isNullString(ddi) &&
    ddi.trim().length > 0 &&
    typeof ddd === 'string' &&
    !isNullString(ddd) &&
    ddd.trim().length > 0 &&
    typeof valor === 'string' &&
    !isNullString(valor) &&
    valor.trim().length > 0
  )
}

export function getPhoneValue(
  phone: PhoneData | null | undefined
): string | undefined {
  if (!hasValidPhone(phone)) {
    return undefined
  }

  const principal = phone!.principal!
  const ddi = principal.ddi!.trim()
  const ddd = principal.ddd!.trim()
  const valor = principal.valor!.trim()

  // Double check for "null" strings
  if (ddi.toLowerCase() === 'null' || ddd.toLowerCase() === 'null' || valor.toLowerCase() === 'null') {
    return undefined
  }

  return `+${ddi} ${ddd} ${valor}`
}

export function normalizePhoneData(
  phone: PhoneData | null | undefined
): PhoneData {
  return phone || { principal: { ddi: '', ddd: '', valor: '' } }
}

export function getPhoneComponents(
  phone: PhoneData | null | undefined
): { ddi: string; ddd: string; valor: string } | null {
  if (!hasValidPhone(phone)) {
    return null
  }

  const principal = phone!.principal!
  return {
    ddi: principal.ddi!.trim(),
    ddd: principal.ddd!.trim(),
    valor: principal.valor!.trim(),
  }
}
