import { getChamadoDetail } from '@/http-pref-rio-cidadao/default/default'
import { IS_MOCK_ENABLED, MOCK_DETAIL, MOCK_PROTOCOLS } from '@/mocks/chamados'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ protocolo: string }> }
) {
  const { protocolo } = await params

  if (IS_MOCK_ENABLED && MOCK_PROTOCOLS.includes(protocolo)) {
    return NextResponse.json(MOCK_DETAIL[protocolo], { status: 200 })
  }

  const result = await getChamadoDetail(protocolo)

  const data =
    typeof result.data === 'string' ? JSON.parse(result.data) : result.data
  return NextResponse.json(data, { status: result.status })
}
