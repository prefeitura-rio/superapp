import {
  CADMICRO_ALLOWED_CONTENT_TYPES,
  CADMICRO_SIGNED_URL_TTL_MS,
  buildCadmicroObjectPath,
  buildObjectUrl,
  createGcsStorage,
  getCpfDigitsFromAccessToken,
  getGcsCredentials,
  isCadmicroFileKind,
} from '@/lib/cadmicro/gcs'
import { isJwtExpired } from '@/lib/jwt-utils'
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

  if (!contentType || !CADMICRO_ALLOWED_CONTENT_TYPES[contentType]) {
    return NextResponse.json(
      {
        error: `Tipo de arquivo não permitido. Use: ${Object.keys(CADMICRO_ALLOWED_CONTENT_TYPES).join(', ')}`,
      },
      { status: 400 }
    )
  }

  if (!isCadmicroFileKind(kind)) {
    return NextResponse.json(
      { error: 'Tipo de documento inválido' },
      { status: 400 }
    )
  }

  const objectPath = buildCadmicroObjectPath(cpfDigits, kind, contentType)
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
        expires: Date.now() + CADMICRO_SIGNED_URL_TTL_MS,
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
