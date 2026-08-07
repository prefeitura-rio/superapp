import { getChamadoPublico } from '@/http-pref-rio-chamados-publico/default/default'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ protocolo: string }> }
) {
  const { protocolo } = await params
  const result = await getChamadoPublico(protocolo)

  const data =
    typeof result.data === 'string' ? JSON.parse(result.data) : result.data
  // TODO: remover após verificar campos de data
  console.log('[chamados-publico] raw response:', JSON.stringify(data, null, 2))
  return NextResponse.json(data, { status: result.status })
}
