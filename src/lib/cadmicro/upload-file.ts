import type { CadmicroFileKind } from '@/lib/cadmicro/file-types'

const ACCEPTED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/pdf',
] as const

const MAX_FILE_SIZE_BYTES = 7 * 1024 * 1024

export interface CadmicroUploadResult {
  objectUrl: string
  fileName: string
  fileSize: number
  contentType: string
}

export class CadmicroUploadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CadmicroUploadError'
  }
}

function resolveContentType(file: File): string | null {
  if (
    ACCEPTED_MIME_TYPES.includes(
      file.type as (typeof ACCEPTED_MIME_TYPES)[number]
    )
  ) {
    return file.type === 'image/jpg' ? 'image/jpeg' : file.type
  }

  const extension = file.name.split('.').pop()?.toLowerCase()
  if (extension === 'png') return 'image/png'
  if (extension === 'jpeg' || extension === 'jpg') return 'image/jpeg'
  if (extension === 'pdf') return 'application/pdf'
  return null
}

export function validateCadmicroFile(file: File): string | null {
  const contentType = resolveContentType(file)
  if (!contentType) return 'Formato inválido. Use PNG, JPEG ou PDF.'
  if (file.size > MAX_FILE_SIZE_BYTES) return 'Arquivo maior que 7MB.'
  return null
}

export async function uploadCadmicroFile(
  file: File,
  kind: CadmicroFileKind
): Promise<CadmicroUploadResult> {
  const validationError = validateCadmicroFile(file)
  if (validationError) throw new CadmicroUploadError(validationError)

  const contentType = resolveContentType(file)
  if (!contentType)
    throw new CadmicroUploadError('Formato inválido. Use PNG, JPEG ou PDF.')

  const res = await fetch('/api/cadmicro/files/signed-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentType, kind }),
  })

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new CadmicroUploadError(data.error ?? 'Erro ao obter URL de upload')
  }

  const { signedUrl, objectUrl } = (await res.json()) as {
    signedUrl?: string
    objectUrl?: string
  }

  if (!signedUrl || !objectUrl) {
    throw new CadmicroUploadError('Resposta inválida do serviço de upload')
  }

  const uploadRes = await fetch(signedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body: file,
  })

  if (!uploadRes.ok) {
    throw new CadmicroUploadError('Falha ao enviar o arquivo para o servidor')
  }

  return {
    objectUrl,
    fileName: file.name,
    fileSize: file.size,
    contentType,
  }
}
