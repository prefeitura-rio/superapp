import { getChamadoPublico } from '@/http-pref-rio-chamados-publico/default/default'
import { IS_MOCK_ENABLED, MOCK_PROTOCOLS, MOCK_PUBLIC } from '@/mocks/chamados'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ protocolo: string }> }
) {
  const { protocolo } = await params

  if (IS_MOCK_ENABLED && MOCK_PROTOCOLS.includes(protocolo)) {
    return NextResponse.json(MOCK_PUBLIC[protocolo], { status: 200 })
  }

  const result = await getChamadoPublico(protocolo)

  const data =
    typeof result.data === 'string' ? JSON.parse(result.data) : result.data
  return NextResponse.json(data, { status: result.status })
}
