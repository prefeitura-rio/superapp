import { authorizeCadmicroObjectRead } from '@/lib/cadmicro/authorize-object-read'
import { createGcsStorage } from '@/lib/cadmicro/gcs'
import { type NextRequest, NextResponse } from 'next/server'

function contentTypeForPath(objectPath: string): string {
  const lower = objectPath.toLowerCase()
  if (lower.endsWith('.pdf')) return 'application/pdf'
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg'
  return 'application/octet-stream'
}

/**
 * Same-origin proxy for CadMicro GCS objects (avoids browser CORS with react-pdf).
 */
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

  const stableObjectUrl = objectUrl.split('?')[0]

  const auth = await authorizeCadmicroObjectRead({
    objectUrl: stableObjectUrl,
    vehicleId,
  })
  if (!auth.ok) return auth.response

  const storage = createGcsStorage(auth.value.credentials)

  try {
    const [buffer] = await storage
      .bucket(auth.value.credentials.bucketName)
      .file(auth.value.objectPath)
      .download()

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentTypeForPath(auth.value.objectPath),
        'Cache-Control': 'private, max-age=60',
      },
    })
  } catch (err) {
    console.error('GCS download (content proxy) failed:', err)
    return NextResponse.json(
      { error: 'Não foi possível baixar o arquivo' },
      { status: 502 }
    )
  }
}
