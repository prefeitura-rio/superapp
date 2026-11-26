'use client'

import { LoginEventTracker } from '@/app/components/login-event-tracker'
import { useCookieConsent } from '@/hooks/use-cookie-consent'
import {
  cleanUpTrackingData,
  getCookieConsent,
} from '@/lib/cookie-consent/browser'
import { pushConsentModeDefault } from '@/lib/cookie-consent/consent-mode'
import { GoogleAnalytics } from '@next/third-parties/google'
import { useEffect, useState } from 'react'

interface ConsentGatedAnalyticsProps {
  gaId?: string
  nonce?: string
  debugMode?: boolean
}

/**
 * Carrega o Google Analytics (gtag.js) e o evento de login só depois do
 * consentimento de análise. É o único terceiro de medição do Pref.Rio: sem
 * Google Tag Manager, gravação de sessão ou publicidade.
 *
 * Sem escolha (ou com recusa) nenhum script, preload ou requisição vai para o
 * Google. A decisão é no cliente porque o HTML das páginas públicas é o mesmo
 * para todos (cache público no CDN). Por garantia, o Consent Mode começa com
 * `analytics_storage` negado.
 *
 * Na carga, também apaga cookies de ferramentas removidas e de categorias sem
 * permissão (`cleanUpTrackingData`).
 */
export function ConsentGatedAnalytics({
  gaId,
  nonce,
  debugMode = false,
}: ConsentGatedAnalyticsProps) {
  const consent = useCookieConsent()
  // O Consent Mode padrão precisa entrar no dataLayer antes do gtag('config').
  // O GA só é montado no render seguinte a este efeito.
  const [isConsentModeReady, setIsConsentModeReady] = useState(false)

  useEffect(() => {
    cleanUpTrackingData()
    pushConsentModeDefault(getCookieConsent())
    setIsConsentModeReady(true)
  }, [])

  if (!isConsentModeReady || !consent?.analytics || !gaId) return null

  return (
    <>
      <GoogleAnalytics gaId={gaId} nonce={nonce} debugMode={debugMode} />
      {/* Depois do GA: o efeito dele define window.gtag antes do evento. */}
      <LoginEventTracker />
    </>
  )
}
