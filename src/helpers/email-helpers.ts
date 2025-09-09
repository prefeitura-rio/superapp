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
    return email.trim().length > 0
  }

  // Null/undefined
  if (!email) {
    return false
  }

  // Object with structure
  const valor = email.principal?.valor
  return typeof valor === 'string' && valor.trim().length > 0
}

export function getEmailValue(
  email: EmailData | string | null | undefined
): string | undefined {
  if (typeof email === 'string' && email.trim().length > 0) {
    return email.trim()
  }

  if (
    typeof email === 'object' &&
    email?.principal?.valor &&
    typeof email.principal.valor === 'string'
  ) {
    const trimmed = email.principal.valor.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }

  return undefined
}

export function normalizeEmailData(
  email: EmailData | null | undefined
): EmailData {
  return email || { principal: { valor: '' } }
}
