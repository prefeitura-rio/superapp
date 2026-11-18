import { listChamados } from '@/http-pref-rio-cidadao/default/default'
import { listarSgrcMock } from '@/lib/chamados/mock-sgrc'
import {
  isSalesforceServicesEnabled,
  isSgrcHistoryMockEnabled,
} from '@/lib/feature-flags'
import { parseJsonBody } from '@/lib/parse-json-body'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

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

  const result = await listChamados()
  const data = parseJsonBody(result.data)
  return NextResponse.json(data, { status: result.status })
}
