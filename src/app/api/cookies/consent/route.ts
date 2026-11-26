import { LEGACY_COOKIE_CONSENT_COOKIE } from '@/lib/cookie-consent/consent'
import { addSpanEvent, withSpan } from '@/lib/telemetry'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * Registro da escolha de cookies, sem dados pessoais.
 *
 * A escolha em si é gravada pelo navegador no cookie `prefrio_cookie_consent`
 * (ver `src/lib/cookie-consent`). Esta rota só:
 * - registra na telemetria quais categorias foram aceitas, por versão da
 *   política (estatística agregada, sem identificar o cidadão);
 * - apaga o cookie httpOnly do banner antigo (`cookieConsent`), que o
 *   JavaScript não consegue apagar.
 */
const consentSchema = z.object({
  version: z.number().int().positive(),
  analytics: z.boolean(),
})

export async function POST(request: NextRequest) {
  return withSpan('api.cookies.consent', async span => {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const parsed = consentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid consent' }, { status: 400 })
    }

    const { version, analytics } = parsed.data
    span.setAttribute('consent.version', version)
    span.setAttribute('consent.analytics', analytics)
    addSpanEvent('consent.updated', { version, analytics })

    const response = new NextResponse(null, { status: 204 })
    if (request.cookies.has(LEGACY_COOKIE_CONSENT_COOKIE)) {
      response.cookies.delete(LEGACY_COOKIE_CONSENT_COOKIE)
    }
    return response
  })
}
