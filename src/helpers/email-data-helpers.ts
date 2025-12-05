export interface EmailData {
  principal?: {
    valor?: string | null
  } | null
}

// Validations for non-empty emails in user data

export interface EmailData {
  principal?: {
    valor?: string | null
  } | null
}

export function hasValidEmail(
  email: EmailData | string | null | undefined
): boolean {
  // String
  if (typeof email === 'string') {
    const trimmed = email.trim()
    return trimmed.length > 0 && trimmed.toLowerCase() !== 'null'
  }

  // Null/undefined
  if (!email) {
    return false
  }

  // Object with structure
  const valor = email.principal?.valor
  if (typeof valor === 'string') {
    const trimmed = valor.trim()
    return trimmed.length > 0 && trimmed.toLowerCase() !== 'null'
  }
  return false
}

export function getEmailValue(
  email: EmailData | string | null | undefined
): string | undefined {
  if (typeof email === 'string') {
    const trimmed = email.trim()
    if (trimmed.length > 0 && trimmed.toLowerCase() !== 'null') {
      return trimmed
    }
    return undefined
  }

  if (
    typeof email === 'object' &&
    email?.principal?.valor &&
    typeof email.principal.valor === 'string'
  ) {
    const trimmed = email.principal.valor.trim()
    if (trimmed.length > 0 && trimmed.toLowerCase() !== 'null') {
      return trimmed
    }
    return undefined
  }

  return undefined
}

export function normalizeEmailData(
  email: EmailData | null | undefined
): EmailData {
  return email || { principal: { valor: '' } }
}
