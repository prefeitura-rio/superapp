import { isJwtExpired } from '@/lib/jwt-utils'
import {
  RIOMOB_ALLOWED_CONTENT_TYPES,
  RIOMOB_SIGNED_URL_TTL_MS,
  buildObjectUrl,
  buildRiomobObjectPath,
  createGcsStorage,
  getCpfDigitsFromAccessToken,
  getGcsCredentials,
  isRiomobFileKind,
} from '@/lib/riomob/gcs'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')

  if (!accessToken || isJwtExpired(accessToken.value)) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const cpfDigits = getCpfDigitsFromAccessToken(accessToken.value)
  if (!cpfDigits) {
    return NextResponse.json(
      { error: 'Não foi possível identificar o cidadão' },
      { status: 401 }
    )
  }

  const credentials = getGcsCredentials()
  if (!credentials) {
    console.error('GCS credentials not configured')
    return NextResponse.json(
      { error: 'Serviço de upload não configurado' },
      { status: 503 }
    )
  }

  let body: { contentType?: string; kind?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { contentType, kind } = body

  if (!contentType || !RIOMOB_ALLOWED_CONTENT_TYPES[contentType]) {
    return NextResponse.json(
      {
        error: `Tipo de arquivo não permitido. Use: ${Object.keys(RIOMOB_ALLOWED_CONTENT_TYPES).join(', ')}`,
      },
      { status: 400 }
    )
  }

  if (!isRiomobFileKind(kind)) {
    return NextResponse.json(
      { error: 'Tipo de documento inválido' },
      { status: 400 }
    )
  }

  const objectPath = buildRiomobObjectPath(cpfDigits, kind, contentType)
  const objectUrl = buildObjectUrl(credentials.bucketName, objectPath)
  const storage = createGcsStorage(credentials)

  try {
    // Private objects — no x-goog-acl / public-read (citizen documents).
    const [signedUrl] = await storage
      .bucket(credentials.bucketName)
      .file(objectPath)
      .getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + RIOMOB_SIGNED_URL_TTL_MS,
        contentType,
      })

    return NextResponse.json({ signedUrl, objectUrl })
  } catch (err) {
    console.error('GCS getSignedUrl (write) failed:', err)
    return NextResponse.json(
      { error: 'Não foi possível gerar o link de upload' },
      { status: 502 }
    )
  }
}
