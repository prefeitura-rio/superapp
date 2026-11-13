import { listChamados } from '@/http-pref-rio-cidadao/default/default'
import { listarSgrcMock } from '@/lib/chamados/mock-sgrc'
import {
  isSalesforceServicesEnabled,
  isSgrcHistoryMockEnabled,
} from '@/lib/feature-flags'
import { parseJsonBody } from '@/lib/parse-json-body'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  if (!isSalesforceServicesEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const origem = new URL(req.url).searchParams.get('origem')
  if (origem === 'sgrc') {
    // The real SGRC history (filtered by the citizen's CPF) does not exist yet.
    // Outside the explicit mock mode, answer "not implemented" instead of
    // handing every citizen the same fictitious records.
    const resposta = isSgrcHistoryMockEnabled()
      ? NextResponse.json(listarSgrcMock())
      : NextResponse.json({ error: 'Not implemented' }, { status: 501 })
    resposta.headers.set('Cache-Control', 'private, no-store')
    return resposta
  }

  const result = await listChamados()

  const data = parseJsonBody(result.data)
  return NextResponse.json(data, { status: result.status })
}
