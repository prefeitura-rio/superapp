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
  return NextResponse.json(data, { status: result.status })
}
