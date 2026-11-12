import { getChamadoDetail } from '@/http-pref-rio-cidadao/default/default'
import { detalheSgrcMock, ehProtocoloSgrcMock } from '@/lib/chamados/mock-sgrc'
import { isSalesforceServicesEnabled } from '@/lib/feature-flags'
import { parseJsonBody } from '@/lib/parse-json-body'
import { IS_MOCK_ENABLED, MOCK_DETAIL, MOCK_PROTOCOLS } from '@/mocks/chamados'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ protocolo: string }> }
) {
  if (!isSalesforceServicesEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { protocolo } = await params

  if (ehProtocoloSgrcMock(protocolo)) {
    const jar = await cookies()
    const logado = Boolean(jar.get('access_token')?.value)
    const detalhe = logado ? detalheSgrcMock(protocolo, 'dono') : null
    const resposta = NextResponse.json(detalhe ?? {}, {
      status: detalhe ? 200 : 404,
    })
    resposta.headers.set('Cache-Control', 'private, no-store')
    return resposta
  }

  if (IS_MOCK_ENABLED && MOCK_PROTOCOLS.includes(protocolo)) {
    return NextResponse.json(MOCK_DETAIL[protocolo], { status: 200 })
  }

  const result = await getChamadoDetail(protocolo)

  const data = parseJsonBody(result.data)
  return NextResponse.json(data, { status: result.status })
}
