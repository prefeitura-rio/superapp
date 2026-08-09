import {
  RIOMOB_ALLOWED_CONTENT_TYPES,
  RIOMOB_PATH_PREFIX,
  type RiomobFileKind,
  isRiomobFileKind,
  normalizeCpfDigits,
} from '@/lib/riomob/file-types'
import { Storage } from '@google-cloud/storage'
import { jwtDecode } from 'jwt-decode'

export {
  RIOMOB_ALLOWED_CONTENT_TYPES,
  RIOMOB_FILE_KINDS,
  RIOMOB_MAX_FILE_SIZE_BYTES,
  RIOMOB_PATH_PREFIX,
  RIOMOB_SIGNED_URL_TTL_MS,
  type RiomobFileKind,
  isGcsObjectUrl,
  isRiomobFileKind,
  normalizeCpfDigits,
} from '@/lib/riomob/file-types'

export interface GcsCredentials {
  bucketName: string
  clientEmail: string
  privateKey: string
}

export function getGcsCredentials(): GcsCredentials | null {
  const bucketName = process.env.GCS_BUCKET_NAME
  const clientEmail = process.env.GCS_CLIENT_EMAIL
  const privateKey = process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!bucketName || !clientEmail || !privateKey) return null

  return { bucketName, clientEmail, privateKey }
}

export function createGcsStorage(credentials: GcsCredentials) {
  return new Storage({
    credentials: {
      client_email: credentials.clientEmail,
      private_key: credentials.privateKey,
    },
  })
}

interface JwtPayload {
  preferred_username?: string
  cpf?: string
  CPF?: string
}

export function getCpfDigitsFromAccessToken(token: string): string | null {
  try {
    const decoded = jwtDecode<JwtPayload>(token)
    const raw = decoded.cpf || decoded.CPF || decoded.preferred_username
    if (!raw) return null
    const digits = normalizeCpfDigits(raw)
    return /^\d{11}$/.test(digits) ? digits : null
  } catch {
    return null
  }
}

export function buildRiomobObjectPath(
  cpfDigits: string,
  kind: RiomobFileKind,
  contentType: string
): string {
  const ext = RIOMOB_ALLOWED_CONTENT_TYPES[contentType]
  const uuid = crypto.randomUUID()
  return `${RIOMOB_PATH_PREFIX}/${cpfDigits}/${kind}/${uuid}.${ext}`
}

export function buildObjectUrl(bucketName: string, objectPath: string): string {
  return `https://storage.googleapis.com/${bucketName}/${objectPath}`
}

export function parseRiomobObjectUrl(
  objectUrl: string,
  bucketName: string
): { objectPath: string; cpfDigits: string } | null {
  let parsed: URL
  try {
    parsed = new URL(objectUrl)
  } catch {
    return null
  }

  if (parsed.hostname !== 'storage.googleapis.com') return null

  const bucketPrefix = `/${bucketName}/`
  if (!parsed.pathname.startsWith(bucketPrefix)) return null

  // GCS object path without bucket: riomob/<cpf>/<kind>/<uuid>.<ext>
  const objectPath = decodeURIComponent(
    parsed.pathname.slice(bucketPrefix.length)
  )
  if (!objectPath.startsWith(`${RIOMOB_PATH_PREFIX}/`)) return null

  const segments = objectPath.split('/')
  if (segments.length !== 4) return null
  if (segments[0] !== RIOMOB_PATH_PREFIX) return null
  if (!/^\d{11}$/.test(segments[1])) return null
  if (!isRiomobFileKind(segments[2])) return null
  if (!/^[0-9a-f-]{36}\.(png|jpg|pdf)$/i.test(segments[3])) return null

  return { objectPath, cpfDigits: segments[1] }
}

/** Photo URL fields persisted on a vehicle detail (owner or accepted conductor). */
export interface VehiclePhotoUrls {
  serial_number_photo_url?: string | null
  vehicle_photo_url?: string | null
  invoice_photo_url?: string | null
}

export function objectUrlBelongsToVehicle(
  objectUrl: string,
  detail: VehiclePhotoUrls
): boolean {
  const urls = [
    detail.serial_number_photo_url,
    detail.vehicle_photo_url,
    detail.invoice_photo_url,
  ]
  return urls.some(url => typeof url === 'string' && url === objectUrl)
}

/**
 * Own-path CPF match, or membership via vehicle photo URLs from RMI.
 * Callers that need the membership branch must supply `vehiclePhotoUrls`.
 */
export function canSignedReadObjectUrl(params: {
  jwtCpfDigits: string
  pathCpfDigits: string
  objectUrl: string
  vehiclePhotoUrls?: VehiclePhotoUrls | null
}): boolean {
  if (params.pathCpfDigits === params.jwtCpfDigits) return true
  if (!params.vehiclePhotoUrls) return false
  return objectUrlBelongsToVehicle(params.objectUrl, params.vehiclePhotoUrls)
}
