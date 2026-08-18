export const CADMICRO_ALLOWED_CONTENT_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'application/pdf': 'pdf',
}

export const CADMICRO_FILE_KINDS = ['serial', 'vehicle', 'invoice'] as const
export type CadmicroFileKind = (typeof CADMICRO_FILE_KINDS)[number]

export const CADMICRO_MAX_FILE_SIZE_BYTES = 7 * 1024 * 1024
export const CADMICRO_SIGNED_URL_TTL_MS = 15 * 60 * 1000
export const CADMICRO_PATH_PREFIX = 'mobilidade'

export function isCadmicroFileKind(value: unknown): value is CadmicroFileKind {
  return (
    typeof value === 'string' &&
    (CADMICRO_FILE_KINDS as readonly string[]).includes(value)
  )
}

export function isGcsObjectUrl(url: string): boolean {
  return url.startsWith('https://storage.googleapis.com/')
}

export function normalizeCpfDigits(cpf: string): string {
  return cpf.replace(/\D/g, '')
}
