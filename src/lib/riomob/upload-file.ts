import type { RiomobFileKind } from '@/lib/riomob/file-types'

const ACCEPTED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/pdf',
] as const

const MAX_FILE_SIZE_BYTES = 7 * 1024 * 1024

export interface RiomobUploadResult {
  objectUrl: string
  fileName: string
  fileSize: number
  contentType: string
}

export class RiomobUploadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RiomobUploadError'
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

export function validateRiomobFile(file: File): string | null {
  const contentType = resolveContentType(file)
  if (!contentType) return 'Formato inválido. Use PNG, JPEG ou PDF.'
  if (file.size > MAX_FILE_SIZE_BYTES) return 'Arquivo maior que 7MB.'
  return null
}

export async function uploadRiomobFile(
  file: File,
  kind: RiomobFileKind
): Promise<RiomobUploadResult> {
  const validationError = validateRiomobFile(file)
  if (validationError) throw new RiomobUploadError(validationError)

  const contentType = resolveContentType(file)
  if (!contentType)
    throw new RiomobUploadError('Formato inválido. Use PNG, JPEG ou PDF.')

  const res = await fetch('/api/riomob/files/signed-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentType, kind }),
  })

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new RiomobUploadError(data.error ?? 'Erro ao obter URL de upload')
  }

  const { signedUrl, objectUrl } = (await res.json()) as {
    signedUrl?: string
    objectUrl?: string
  }

  if (!signedUrl || !objectUrl) {
    throw new RiomobUploadError('Resposta inválida do serviço de upload')
  }

  const uploadRes = await fetch(signedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body: file,
  })

  if (!uploadRes.ok) {
    throw new RiomobUploadError('Falha ao enviar o arquivo para o servidor')
  }

  return {
    objectUrl,
    fileName: file.name,
    fileSize: file.size,
    contentType,
  }
}
