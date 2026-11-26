import { hasAnalyticsConsent } from '@/lib/cookie-consent/browser'
import { sendGAEvent as sendGAEventToDataLayer } from '@next/third-parties/google'

/**
 * `sendGAEvent` do `@next/third-parties`, mas só com consentimento de análise.
 *
 * Sem consentimento o GA nem é carregado e o evento é descartado em silêncio
 * (o original avisaria no console a cada clique). Use sempre este, e não o
 * import direto de `@next/third-parties/google`.
 *
 * Nunca envie dados pessoais nos parâmetros (nome, CPF, e-mail, telefone).
 */
export function sendGAEvent(
  ...args: Parameters<typeof sendGAEventToDataLayer>
): void {
  if (!hasAnalyticsConsent()) return
  sendGAEventToDataLayer(...args)
}
