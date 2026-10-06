export class CadmicroSignedReadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CadmicroSignedReadError'
  }
}

export interface RequestCadmicroSignedReadOptions {
  /** Required when the object path CPF is not the caller's (e.g. accepted conductor). */
  vehicleId?: string
}

export async function requestCadmicroSignedRead(
  objectUrl: string,
  options?: RequestCadmicroSignedReadOptions
): Promise<string> {
  const res = await fetch('/api/cadmicro/files/signed-read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      objectUrl,
      ...(options?.vehicleId ? { vehicleId: options.vehicleId } : {}),
    }),
  })

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new CadmicroSignedReadError(
      data.error ?? 'Não foi possível abrir o arquivo'
    )
  }

  const { signedUrl } = (await res.json()) as { signedUrl?: string }
  if (!signedUrl) {
    throw new CadmicroSignedReadError(
      'Resposta inválida do serviço de download'
    )
  }

  return signedUrl
}
