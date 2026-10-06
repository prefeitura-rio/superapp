import { authorizeCadmicroObjectRead } from '@/lib/cadmicro/authorize-object-read'
import {
  CADMICRO_SIGNED_URL_TTL_MS,
  createGcsStorage,
} from '@/lib/cadmicro/gcs'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  let body: { objectUrl?: string; vehicleId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { objectUrl, vehicleId } = body
  if (!objectUrl || typeof objectUrl !== 'string') {
    return NextResponse.json(
      { error: 'URL do arquivo é obrigatória' },
      { status: 400 }
    )
  }

  // Strip query (signed URL) → stable object URL for path parse + authz
  const stableObjectUrl = objectUrl.split('?')[0]

  const auth = await authorizeCadmicroObjectRead({
    objectUrl: stableObjectUrl,
    vehicleId,
  })
  if (!auth.ok) return auth.response

  const storage = createGcsStorage(auth.value.credentials)

  try {
    const [signedUrl] = await storage
      .bucket(auth.value.credentials.bucketName)
      .file(auth.value.objectPath)
      .getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + CADMICRO_SIGNED_URL_TTL_MS,
      })

    return NextResponse.json({ signedUrl })
  } catch (err) {
    console.error('GCS getSignedUrl (read) failed:', err)
    return NextResponse.json(
      { error: 'Não foi possível gerar o link de download' },
      { status: 502 }
    )
  }
}
