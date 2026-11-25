import { allowRatingRequest } from '@/lib/carta-servicos/avaliacao/rate-limit'
import {
  SERVICE_SLUG_PATTERN,
  type ServiceRatingErrorCode,
  serviceRatingRequestSchema,
} from '@/lib/carta-servicos/avaliacao/request'
import { submitVote } from '@/lib/carta-servicos/avaliacao/submit-vote'
import {
  VOTER_TOKEN_COOKIE,
  createVoterToken,
  isValidVoterToken,
  voterTokenCookieOptions,
} from '@/lib/carta-servicos/avaliacao/voter-token'
import { previewClientIp } from '@/lib/carta-servicos/preview-rate-limit'
import { isServiceRatingEnabled } from '@/lib/feature-flags'
import { type NextRequest, NextResponse } from 'next/server'

const MAX_BODY_BYTES = 4 * 1024
const noStore = { 'Cache-Control': 'no-store' }

/**
 * Registra o voto "Este conteúdo foi útil?" de um visitante anônimo.
 * Sem login: a identidade é o cookie HttpOnly emitido aqui, nunca pelo browser.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!isServiceRatingEnabled()) {
    return new NextResponse(null, { status: 404, headers: noStore })
  }

  const { slug } = await params
  if (!SERVICE_SLUG_PATTERN.test(slug)) {
    return ratingError(404, 'not_found')
  }

  const text = await request.text().catch(() => null)
  if (text === null || text.length > MAX_BODY_BYTES) {
    return ratingError(400, 'invalid_payload')
  }

  let body: unknown
  try {
    body = JSON.parse(text)
  } catch {
    return ratingError(400, 'invalid_payload')
  }

  const parsed = serviceRatingRequestSchema.safeParse(body)
  if (!parsed.success) {
    return ratingError(400, 'invalid_payload')
  }

  const existingToken = request.cookies.get(VOTER_TOKEN_COOKIE)?.value
  const voterToken = isValidVoterToken(existingToken)
    ? existingToken
    : createVoterToken()

  const withVoterCookie = (response: NextResponse) => {
    if (voterToken !== existingToken) {
      response.cookies.set(
        VOTER_TOKEN_COOKIE,
        voterToken,
        voterTokenCookieOptions()
      )
    }
    return response
  }

  const rateLimit = allowRatingRequest({
    voterToken,
    ip: previewClientIp(request),
  })
  if (!rateLimit.allowed) {
    const response = ratingError(429, 'rate_limited')
    response.headers.set('Retry-After', String(rateLimit.retryAfterSeconds))
    return withVoterCookie(response)
  }

  const result = await submitVote(slug, parsed.data, voterToken)
  if (!result.ok) {
    return withVoterCookie(ratingError(result.status, result.code))
  }

  return withVoterCookie(
    NextResponse.json({ ok: true }, { status: 200, headers: noStore })
  )
}

function ratingError(status: number, code: ServiceRatingErrorCode) {
  return NextResponse.json({ code }, { status, headers: noStore })
}
