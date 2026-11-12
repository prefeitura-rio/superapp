import { listChamados } from '@/http-pref-rio-cidadao/default/default'
import { listarSgrcMock } from '@/lib/chamados/mock-sgrc'
import { isSalesforceServicesEnabled } from '@/lib/feature-flags'
import { parseJsonBody } from '@/lib/parse-json-body'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const origem = new URL(req.url).searchParams.get('origem')
  if (origem === 'sgrc') {
    const resposta = NextResponse.json(listarSgrcMock())
    resposta.headers.set('Cache-Control', 'private, no-store')
    return resposta
  }

  if (!isSalesforceServicesEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const result = await listChamados()

  const data = parseJsonBody(result.data)
  return NextResponse.json(data, { status: result.status })
}
