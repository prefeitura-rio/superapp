import { listChamados } from '@/http-pref-rio-cidadao/default/default'
import { listarSgrcMock } from '@/lib/chamados/mock-sgrc'
import {
  isSalesforceServicesEnabled,
  isSgrcHistoryMockEnabled,
} from '@/lib/feature-flags'
import { parseJsonBody } from '@/lib/parse-json-body'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const ERRO_CONSULTA = 'Não foi possível consultar os chamados'

/**
 * O corpo de erro do Mule/Salesforce (mensagens do gateway, hostname do
 * backend, códigos internos) nunca é repassado ao navegador: só o status e
 * uma mensagem genérica.
 */
function respostaDeErro(status: number) {
  return NextResponse.json({ error: ERRO_CONSULTA }, { status })
}

export async function GET(req: Request) {
  if (!isSalesforceServicesEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const origem = new URL(req.url).searchParams.get('origem')
  if (origem === 'sgrc') {
    // The SGRC history belongs to the logged-in citizen: without a session
    // nothing is served, not even in the explicit mock mode.
    const jar = await cookies()
    const logado = Boolean(jar.get('access_token')?.value)
    const resposta = !logado
      ? NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
      : isSgrcHistoryMockEnabled()
        ? NextResponse.json(listarSgrcMock())
        : NextResponse.json({ error: 'Not implemented' }, { status: 501 })
    resposta.headers.set('Cache-Control', 'private, no-store')
    return resposta
  }

  let result: Awaited<ReturnType<typeof listChamados>>
  try {
    result = await listChamados()
  } catch (error) {
    console.error('Falha ao consultar a lista de chamados:', error)
    return respostaDeErro(502)
  }

  if (result.status >= 400) {
    return respostaDeErro(result.status)
  }

  return NextResponse.json(parseJsonBody(result.data), {
    status: result.status,
  })
}
