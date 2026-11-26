/**
 * Consentimento de cookies: formato do cookie e leitura, sem depender do
 * navegador (roda no servidor e no cliente).
 *
 * Só os cookies necessários funcionam sem escolha. Análise (Google Analytics)
 * fica desligada até o cidadão permitir (LGPD art. 7º, I; Guia de Cookies da
 * ANPD). O Pref.Rio não usa outras ferramentas de terceiros que dependam de
 * consentimento (sem gravação de sessão nem publicidade).
 */

/** Cookie com as escolhas do cidadão. Não é httpOnly: o cliente decide o que carregar. */
export const COOKIE_CONSENT_COOKIE = 'prefrio_cookie_consent'

/**
 * Cookie do banner antigo (httpOnly, valor `true`, "aceitar" genérico). Não
 * vale como consentimento: é ignorado e apagado pela rota de registro.
 */
export const LEGACY_COOKIE_CONSENT_COOKIE = 'cookieConsent'

/**
 * Versão da Política de Cookies a que a escolha se refere. Ao mudar de forma
 * relevante a política (novo terceiro, nova finalidade), incremente: quem
 * escolheu numa versão anterior vê o banner de novo.
 */
export const COOKIE_CONSENT_VERSION = 1

/** A escolha vale por 12 meses; depois o banner pergunta de novo. */
export const COOKIE_CONSENT_MAX_AGE = 60 * 60 * 24 * 365

export const COOKIE_POLICY_ROUTE = '/politicas-de-uso-de-cookies'

/**
 * Categorias que dependem de consentimento. Necessários não entram aqui.
 * Hoje só análise; nova categoria = novo terceiro ou finalidade, então
 * incremente `COOKIE_CONSENT_VERSION` e atualize a Política de cookies.
 */
export const COOKIE_CONSENT_CATEGORIES = ['analytics'] as const

export type CookieConsentCategory = (typeof COOKIE_CONSENT_CATEGORIES)[number]

export type CookieConsentChoices = Record<CookieConsentCategory, boolean>

export interface CookieConsentRecord extends CookieConsentChoices {
  version: number
  /** Data da escolha (ISO 8601), para comprovar quando o consentimento foi dado. */
  updatedAt: string
}

export const ALL_ACCEPTED: CookieConsentChoices = {
  analytics: true,
}

export const ALL_REJECTED: CookieConsentChoices = {
  analytics: false,
}

interface SerializedConsent {
  v: number
  at: string
  analytics: boolean
}

export function serializeCookieConsent(record: CookieConsentRecord): string {
  const payload: SerializedConsent = {
    v: record.version,
    at: record.updatedAt,
    analytics: record.analytics,
  }
  return encodeURIComponent(JSON.stringify(payload))
}

/**
 * Lê o valor do cookie. Devolve `null` (= ainda sem escolha) quando o cookie
 * não existe, está corrompido, é o do banner antigo ou é de outra versão da
 * política. Campos a mais (de builds anteriores) são ignorados.
 */
export function parseCookieConsent(
  raw: string | null | undefined
): CookieConsentRecord | null {
  if (!raw) return null

  let data: unknown
  try {
    data = JSON.parse(safeDecode(raw))
  } catch {
    return null
  }
  if (!isSerializedConsent(data)) return null
  if (data.v !== COOKIE_CONSENT_VERSION) return null

  return {
    version: data.v,
    updatedAt: data.at,
    analytics: data.analytics,
  }
}

export function hasConsentFor(
  record: CookieConsentRecord | null | undefined,
  category: CookieConsentCategory
): boolean {
  return record?.[category] === true
}

/** Categorias que estavam permitidas e deixaram de estar. */
export function getRevokedCategories(
  previous: CookieConsentChoices | null | undefined,
  next: CookieConsentChoices
): CookieConsentCategory[] {
  if (!previous) return []
  return COOKIE_CONSENT_CATEGORIES.filter(
    category => previous[category] && !next[category]
  )
}

/** Categorias sem permissão (negadas ou ainda sem escolha). */
export function getDeniedCategories(
  record: CookieConsentChoices | null | undefined
): CookieConsentCategory[] {
  return COOKIE_CONSENT_CATEGORIES.filter(
    category => record?.[category] !== true
  )
}

function safeDecode(raw: string): string {
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

function isSerializedConsent(data: unknown): data is SerializedConsent {
  if (typeof data !== 'object' || data === null) return false
  const value = data as Record<string, unknown>
  return (
    typeof value.v === 'number' &&
    typeof value.at === 'string' &&
    typeof value.analytics === 'boolean'
  )
}
