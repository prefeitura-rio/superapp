import { getChamadoPublico } from '@/http-pref-rio-chamados-publico/default/default'
import { detalheSgrcMock, ehProtocoloSgrcMock } from '@/lib/chamados/mock-sgrc'
import {
  isSalesforceServicesEnabled,
  isSgrcHistoryMockEnabled,
} from '@/lib/feature-flags'
import { IS_MOCK_ENABLED, MOCK_PROTOCOLS, MOCK_PUBLIC } from '@/mocks/chamados'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ protocolo: string }> }
) {
  if (!isSalesforceServicesEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { protocolo } = await params

  if (isSgrcHistoryMockEnabled() && ehProtocoloSgrcMock(protocolo)) {
    const detalhe = detalheSgrcMock(protocolo, 'publico')
    const resposta = NextResponse.json(detalhe ?? {}, {
      status: detalhe ? 200 : 404,
    })
    resposta.headers.set('Cache-Control', 'private, no-store')
    return resposta
  }

  if (IS_MOCK_ENABLED && MOCK_PROTOCOLS.includes(protocolo)) {
    return NextResponse.json(MOCK_PUBLIC[protocolo], { status: 200 })
  }

  const result = await getChamadoPublico(protocolo)

  const data =
    typeof result.data === 'string' ? JSON.parse(result.data) : result.data
  return NextResponse.json(data, { status: result.status })
}
