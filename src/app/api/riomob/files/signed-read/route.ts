import { getCitizenCpfVehiclesVehicleId } from '@/http/mobilidade/mobilidade'
import { isJwtExpired } from '@/lib/jwt-utils'
import {
  RIOMOB_SIGNED_URL_TTL_MS,
  canSignedReadObjectUrl,
  createGcsStorage,
  getCpfDigitsFromAccessToken,
  getGcsCredentials,
  parseRiomobObjectUrl,
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
      {
        status: 400,
      }
    )
  }

  const parsed = parseRiomobObjectUrl(objectUrl, credentials.bucketName)
  if (!parsed) {
    return NextResponse.json(
      { error: 'URL de arquivo inválida para RioMob' },
      { status: 400 }
    )
  }

  let vehiclePhotoUrls = null
  if (parsed.cpfDigits !== cpfDigits) {
    if (!vehicleId || typeof vehicleId !== 'string') {
      return NextResponse.json(
        { error: 'Sem permissão para acessar este arquivo' },
        { status: 403 }
      )
    }

    const vehicleRes = await getCitizenCpfVehiclesVehicleId(
      cpfDigits,
      vehicleId
    )
    if (vehicleRes.status !== 200) {
      return NextResponse.json(
        { error: 'Sem permissão para acessar este arquivo' },
        { status: 403 }
      )
    }

    vehiclePhotoUrls = vehicleRes.data
  }

  if (
    !canSignedReadObjectUrl({
      jwtCpfDigits: cpfDigits,
      pathCpfDigits: parsed.cpfDigits,
      objectUrl,
      vehiclePhotoUrls,
    })
  ) {
    return NextResponse.json(
      { error: 'Sem permissão para acessar este arquivo' },
      { status: 403 }
    )
  }

  const storage = createGcsStorage(credentials)

  try {
    const [signedUrl] = await storage
      .bucket(credentials.bucketName)
      .file(parsed.objectPath)
      .getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + RIOMOB_SIGNED_URL_TTL_MS,
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
