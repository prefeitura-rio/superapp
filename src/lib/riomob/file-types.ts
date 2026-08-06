export const RIOMOB_ALLOWED_CONTENT_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'application/pdf': 'pdf',
}

export const RIOMOB_FILE_KINDS = ['serial', 'vehicle', 'invoice'] as const
export type RiomobFileKind = (typeof RIOMOB_FILE_KINDS)[number]

export const RIOMOB_MAX_FILE_SIZE_BYTES = 7 * 1024 * 1024
export const RIOMOB_SIGNED_URL_TTL_MS = 15 * 60 * 1000
export const RIOMOB_PATH_PREFIX = 'riomob'

export function isRiomobFileKind(value: unknown): value is RiomobFileKind {
  return (
    typeof value === 'string' &&
    (RIOMOB_FILE_KINDS as readonly string[]).includes(value)
  )
}

export function isGcsObjectUrl(url: string): boolean {
  return url.startsWith('https://storage.googleapis.com/')
}

export function normalizeCpfDigits(cpf: string): string {
  return cpf.replace(/\D/g, '')
}
