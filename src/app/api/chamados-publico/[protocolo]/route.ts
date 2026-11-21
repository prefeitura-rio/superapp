import { getChamadoPublico } from '@/http-pref-rio-chamados-publico/default/default'
import { detalheSgrcMock, ehProtocoloSgrcMock } from '@/lib/chamados/mock-sgrc'
import {
  isSalesforceServicesEnabled,
  isSgrcHistoryMockEnabled,
} from '@/lib/feature-flags'
import { parseJsonBody } from '@/lib/parse-json-body'
import { IS_MOCK_ENABLED, MOCK_PROTOCOLS, MOCK_PUBLIC } from '@/mocks/chamados'
import { NextResponse } from 'next/server'

const ERRO_NAO_ENCONTRADO = 'Chamado não encontrado'
const ERRO_CONSULTA = 'Não foi possível consultar o chamado'

/**
 * Rota pública e anônima: o corpo de erro do Mule/Salesforce (hostname do
 * backend, path do Apex REST, códigos internos) nunca é repassado ao cliente.
 */
function respostaDeErro(status: number) {
  const error = status === 404 ? ERRO_NAO_ENCONTRADO : ERRO_CONSULTA
  return NextResponse.json({ error }, { status })
}

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

  let result: Awaited<ReturnType<typeof getChamadoPublico>>
  try {
    result = await getChamadoPublico(protocolo)
  } catch (error) {
    console.error('Falha ao consultar chamado público:', error)
    return respostaDeErro(502)
  }

  if (result.status >= 400) {
    return respostaDeErro(result.status)
  }

  return NextResponse.json(parseJsonBody(result.data), {
    status: result.status,
  })
}
