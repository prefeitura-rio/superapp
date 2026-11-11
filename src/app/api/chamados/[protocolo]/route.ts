import { getChamadoDetail } from '@/http-pref-rio-cidadao/default/default'
import { isSalesforceServicesEnabled } from '@/lib/feature-flags'
import { parseJsonBody } from '@/lib/parse-json-body'
import { IS_MOCK_ENABLED, MOCK_DETAIL, MOCK_PROTOCOLS } from '@/mocks/chamados'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ protocolo: string }> }
) {
  if (!isSalesforceServicesEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { protocolo } = await params

  if (IS_MOCK_ENABLED && MOCK_PROTOCOLS.includes(protocolo)) {
    return NextResponse.json(MOCK_DETAIL[protocolo], { status: 200 })
  }

  const result = await getChamadoDetail(protocolo)

  const data = parseJsonBody(result.data)
  return NextResponse.json(data, { status: result.status })
}
