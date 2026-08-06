export class RiomobSignedReadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RiomobSignedReadError'
  }
}

export async function requestRiomobSignedRead(
  objectUrl: string
): Promise<string> {
  const res = await fetch('/api/riomob/files/signed-read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ objectUrl }),
  })

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new RiomobSignedReadError(
      data.error ?? 'Não foi possível abrir o arquivo'
    )
  }

  const { signedUrl } = (await res.json()) as { signedUrl?: string }
  if (!signedUrl) {
    throw new RiomobSignedReadError('Resposta inválida do serviço de download')
  }

  return signedUrl
}
