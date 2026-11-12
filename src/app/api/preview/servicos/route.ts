import { isPreviewCartaServicosEnabled } from '@/constants/venvs'
import { PREVIEW_MAX_BODY_BYTES } from '@/lib/carta-servicos/preview-protocol'
import {
  allowPreviewRequest,
  previewClientIp,
} from '@/lib/carta-servicos/preview-rate-limit'
import {
  cartaServiceDetailSchema,
  prepareServicePreview,
} from '@/lib/carta-servicos/preview-service'
import { NextResponse } from 'next/server'

const noStore = { 'Cache-Control': 'no-store' }

function previewError(
  status: number,
  code: 'payload_too_large' | 'invalid_payload' | 'rate_limited'
) {
  return NextResponse.json({ code }, { status, headers: noStore })
}

export async function POST(request: Request) {
  if (!isPreviewCartaServicosEnabled()) {
    return new NextResponse(null, { status: 404, headers: noStore })
  }

  if (!allowPreviewRequest(previewClientIp(request))) {
    return previewError(429, 'rate_limited')
  }

  const contentLength = Number(request.headers.get('content-length') ?? '0')
  if (
    Number.isFinite(contentLength) &&
    contentLength > PREVIEW_MAX_BODY_BYTES
  ) {
    return previewError(413, 'payload_too_large')
  }

  let text: string
  try {
    text = await request.text()
  } catch {
    return previewError(400, 'invalid_payload')
  }

  if (text.length > PREVIEW_MAX_BODY_BYTES) {
    return previewError(413, 'payload_too_large')
  }

  let body: unknown
  try {
    body = JSON.parse(text)
  } catch {
    return previewError(400, 'invalid_payload')
  }

  const parsed = cartaServiceDetailSchema.safeParse(body)
  if (!parsed.success) {
    return previewError(400, 'invalid_payload')
  }

  const preview = prepareServicePreview(parsed.data)
  return NextResponse.json(preview, { status: 200, headers: noStore })
}
