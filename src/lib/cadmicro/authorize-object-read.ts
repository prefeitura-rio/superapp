import { getCitizenCpfVehiclesVehicleId } from '@/http/mobilidade/mobilidade'
import {
  type GcsCredentials,
  canSignedReadObjectUrl,
  getCpfDigitsFromAccessToken,
  getGcsCredentials,
  parseCadmicroObjectUrl,
} from '@/lib/cadmicro/gcs'
import { isJwtExpired } from '@/lib/jwt-utils'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export type AuthorizedCadmicroObject = {
  credentials: GcsCredentials
  objectPath: string
  objectUrl: string
}

type AuthorizeResult =
  | { ok: true; value: AuthorizedCadmicroObject }
  | { ok: false; response: NextResponse }

/**
 * Shared authz for signed-read / content proxy: JWT + own CPF path or vehicle membership.
 */
export async function authorizeCadmicroObjectRead(params: {
  objectUrl: string
  vehicleId?: string
}): Promise<AuthorizeResult> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')

  if (!accessToken || isJwtExpired(accessToken.value)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      ),
    }
  }

  const cpfDigits = getCpfDigitsFromAccessToken(accessToken.value)
  if (!cpfDigits) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Não foi possível identificar o cidadão' },
        { status: 401 }
      ),
    }
  }

  const credentials = getGcsCredentials()
  if (!credentials) {
    console.error('GCS credentials not configured')
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Serviço de upload não configurado' },
        { status: 503 }
      ),
    }
  }

  const { objectUrl, vehicleId } = params
  const parsed = parseCadmicroObjectUrl(objectUrl, credentials.bucketName)
  if (!parsed) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'URL de arquivo inválida para CadMicro' },
        { status: 400 }
      ),
    }
  }

  let vehiclePhotoUrls = null
  if (parsed.cpfDigits !== cpfDigits) {
    if (!vehicleId || typeof vehicleId !== 'string') {
      return {
        ok: false,
        response: NextResponse.json(
          { error: 'Sem permissão para acessar este arquivo' },
          { status: 403 }
        ),
      }
    }

    const vehicleRes = await getCitizenCpfVehiclesVehicleId(
      cpfDigits,
      vehicleId
    )
    if (vehicleRes.status !== 200) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: 'Sem permissão para acessar este arquivo' },
          { status: 403 }
        ),
      }
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
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Sem permissão para acessar este arquivo' },
        { status: 403 }
      ),
    }
  }

  return {
    ok: true,
    value: {
      credentials,
      objectPath: parsed.objectPath,
      objectUrl,
    },
  }
}
