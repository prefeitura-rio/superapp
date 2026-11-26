import { LOGIN_MARKER_COOKIE } from '@/lib/analytics/login-marker'
import {
  COOKIE_CONSENT_COOKIE,
  COOKIE_CONSENT_MAX_AGE,
  COOKIE_CONSENT_VERSION,
  type CookieConsentCategory,
  type CookieConsentChoices,
  type CookieConsentRecord,
  getDeniedCategories,
  getRevokedCategories,
  hasConsentFor,
  parseCookieConsent,
  serializeCookieConsent,
} from './consent'
import { pushConsentModeUpdate } from './consent-mode'

/**
 * Estado do consentimento no navegador.
 *
 * A decisão de carregar o GA é tomada aqui, no cliente, e não no servidor:
 * as páginas públicas são servidas com cache público pelo CDN, então a mesma
 * resposta HTML chega a quem aceitou e a quem recusou.
 */

const listeners = new Set<() => void>()

let cachedRaw: string | undefined
let cachedRecord: CookieConsentRecord | null = null
let hasCache = false

/** Escolha atual, ou `null` se o cidadão ainda não escolheu. */
export function getCookieConsent(): CookieConsentRecord | null {
  if (typeof document === 'undefined') return null
  const raw = readCookie(COOKIE_CONSENT_COOKIE)
  if (!hasCache || raw !== cachedRaw) {
    cachedRaw = raw
    cachedRecord = parseCookieConsent(raw)
    hasCache = true
  }
  return cachedRecord
}

export function hasAnalyticsConsent(): boolean {
  return hasConsentFor(getCookieConsent(), 'analytics')
}

export function subscribeCookieConsent(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export interface SaveCookieConsentResult {
  record: CookieConsentRecord
  /** Categorias permitidas antes e negadas agora: a página precisa recarregar. */
  revoked: CookieConsentCategory[]
}

/**
 * Grava a escolha, atualiza o Consent Mode e apaga os cookies e o
 * armazenamento local dos terceiros de toda categoria negada (não só das
 * revogadas agora: o navegador pode ter cookies de antes do banner).
 */
export function saveCookieConsent(
  choices: CookieConsentChoices
): SaveCookieConsentResult {
  const previous = getCookieConsent()
  const record: CookieConsentRecord = {
    version: COOKIE_CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
    analytics: choices.analytics,
  }

  writeCookie(
    COOKIE_CONSENT_COOKIE,
    serializeCookieConsent(record),
    COOKIE_CONSENT_MAX_AGE
  )
  pushConsentModeUpdate(record)

  const revoked = getRevokedCategories(previous, record)
  clearTrackingData(getDeniedCategories(record))

  reportConsent(record)
  emit(listeners)
  return { record, revoked }
}

/**
 * Faxina na carga do app, antes de qualquer script de terceiros:
 * - apaga o que ferramentas já removidas deixaram (Hotjar);
 * - apaga cookies de categorias sem permissão. Antes do banner atual o GA
 *   rodava para todos, então quem nunca aceitou pode ter `_ga*` antigos.
 */
export function cleanUpTrackingData() {
  if (typeof document === 'undefined') return
  clearByPrefixes(REMOVED_TOOLS_PREFIXES)
  clearTrackingData(getDeniedCategories(getCookieConsent()))
}

// ---------------------------------------------------------------------------
// Painel de preferências (aberto pelo banner, pelo rodapé e pela política)
// ---------------------------------------------------------------------------

const preferencesListeners = new Set<() => void>()
let isPreferencesOpen = false

export function openCookiePreferences() {
  setPreferencesOpen(true)
}

export function closeCookiePreferences() {
  setPreferencesOpen(false)
}

export function getCookiePreferencesOpen() {
  return isPreferencesOpen
}

export function subscribeCookiePreferences(listener: () => void) {
  preferencesListeners.add(listener)
  return () => {
    preferencesListeners.delete(listener)
  }
}

function setPreferencesOpen(open: boolean) {
  if (isPreferencesOpen === open) return
  isPreferencesOpen = open
  emit(preferencesListeners)
}

// ---------------------------------------------------------------------------
// Revogação: limpeza do que os terceiros gravaram
// ---------------------------------------------------------------------------

/**
 * Prefixos de cookies e chaves de armazenamento de cada categoria.
 * - Análise: Google Analytics (`_ga`, `_ga_<ID>`, `_gid`, `_gat`) e o
 *   marcador de login.
 */
const TRACKING_PREFIXES: Record<CookieConsentCategory, string[]> = {
  analytics: ['_ga', '_gid', '_gat', LOGIN_MARKER_COOKIE],
}

/**
 * Ferramentas que o Pref.Rio deixou de usar e que rodavam para todos antes do
 * banner atual. O que elas gravaram é apagado de todo visitante.
 * - Hotjar (removido em novembro de 2026): `_hjSessionUser_<ID>`,
 *   `_hjSession_<ID>` e demais `_hj*`, em cookies e no local/sessionStorage.
 *   Os cookies dele duram no máximo 1 ano: remover a partir de dezembro de
 *   2027.
 */
const REMOVED_TOOLS_PREFIXES = ['_hj']

export function clearTrackingData(categories: CookieConsentCategory[]) {
  clearByPrefixes(categories.flatMap(category => TRACKING_PREFIXES[category]))
}

function clearByPrefixes(prefixes: string[]) {
  if (prefixes.length === 0) return
  const matches = (name: string) =>
    prefixes.some(prefix => name.startsWith(prefix))

  for (const name of listCookieNames()) {
    if (matches(name)) deleteCookieEverywhere(name)
  }
  for (const storage of getStorages()) {
    for (const key of Object.keys(storage)) {
      if (matches(key)) storage.removeItem(key)
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function emit(set: Set<() => void>) {
  for (const listener of set) listener()
}

/**
 * Registro no servidor (telemetria, sem dados pessoais) e limpeza do cookie
 * httpOnly do banner antigo, que o JavaScript não consegue apagar. Falhar
 * aqui não desfaz a escolha, que já está gravada no cookie.
 */
function reportConsent(record: CookieConsentRecord) {
  if (typeof fetch !== 'function') return
  try {
    fetch('/api/cookies/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        version: record.version,
        analytics: record.analytics,
      }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // Sem rede ou URL relativa fora do navegador: ignorar.
  }
}

function readCookie(name: string): string | undefined {
  const prefix = `${name}=`
  return document.cookie
    .split('; ')
    .find(row => row.startsWith(prefix))
    ?.slice(prefix.length)
}

function writeCookie(name: string, value: string, maxAge: number) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${name}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`
}

function listCookieNames(): string[] {
  return document.cookie
    .split(';')
    .map(row => row.split('=')[0]?.trim())
    .filter((name): name is string => Boolean(name))
}

/**
 * O GA grava no domínio mais alto possível (ex.: `.pref.rio`) e outras
 * ferramentas no domínio atual. Um cookie só é apagado com o mesmo `Domain`,
 * então tenta o host e cada domínio pai.
 */
function deleteCookieEverywhere(name: string) {
  const expired = `${name}=; Path=/; Max-Age=0`
  document.cookie = expired
  const parts = window.location.hostname.split('.')
  for (let i = 0; i < parts.length - 1; i++) {
    document.cookie = `${expired}; Domain=${parts.slice(i).join('.')}`
  }
}

function getStorages(): Storage[] {
  const storages: Storage[] = []
  try {
    storages.push(window.localStorage)
  } catch {
    // Armazenamento bloqueado pelo navegador.
  }
  try {
    storages.push(window.sessionStorage)
  } catch {
    // Armazenamento bloqueado pelo navegador.
  }
  return storages
}
