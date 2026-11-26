'use client'

import {
  getCookieConsent,
  getCookiePreferencesOpen,
  subscribeCookieConsent,
  subscribeCookiePreferences,
} from '@/lib/cookie-consent/browser'
import type { CookieConsentRecord } from '@/lib/cookie-consent/consent'
import { useSyncExternalStore } from 'react'

/**
 * Escolha de cookies do cidadão.
 *
 * - `undefined`: ainda não lida (render no servidor e hidratação). Nada de
 *   terceiros deve carregar e o banner não deve piscar.
 * - `null`: o cidadão ainda não escolheu.
 * - registro: a escolha atual.
 */
export function useCookieConsent(): CookieConsentRecord | null | undefined {
  return useSyncExternalStore(
    subscribeCookieConsent,
    getCookieConsent,
    getServerSnapshot
  )
}

/** Se o painel de preferências de cookies está aberto. */
export function useCookiePreferencesOpen(): boolean {
  return useSyncExternalStore(
    subscribeCookiePreferences,
    getCookiePreferencesOpen,
    () => false
  )
}

function getServerSnapshot(): undefined {
  return undefined
}
