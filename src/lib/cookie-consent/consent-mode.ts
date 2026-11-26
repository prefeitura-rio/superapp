import type { CookieConsentRecord } from './consent'

/**
 * Google Consent Mode v2, como segunda barreira: o GA e o GTM só são
 * carregados depois do consentimento (ver `ConsentGatedAnalytics`), mas se o
 * container do GTM tiver uma tag do Google, ela também respeita o estado
 * abaixo e não grava cookies sem consentimento de análise.
 *
 * Publicidade fica sempre negada: o Pref.Rio não usa cookies de publicidade.
 *
 * `window.dataLayer` já é tipado por `@next/third-parties/google`.
 */

type ConsentValue = 'granted' | 'denied'

interface ConsentModeState {
  ad_storage: ConsentValue
  ad_user_data: ConsentValue
  ad_personalization: ConsentValue
  analytics_storage: ConsentValue
}

export function toConsentModeState(
  record: CookieConsentRecord | null
): ConsentModeState {
  return {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: record?.analytics ? 'granted' : 'denied',
  }
}

/** Precisa rodar antes do `gtag('config')` e do `gtm.js`. */
export function pushConsentModeDefault(record: CookieConsentRecord | null) {
  gtag('consent', 'default', toConsentModeState(record))
}

export function pushConsentModeUpdate(record: CookieConsentRecord | null) {
  gtag('consent', 'update', toConsentModeState(record))
}

function gtag(..._args: unknown[]) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  // biome-ignore lint/style/noArguments: o gtag.js só reconhece comandos empilhados como o objeto `arguments`
  window.dataLayer.push(arguments)
}
