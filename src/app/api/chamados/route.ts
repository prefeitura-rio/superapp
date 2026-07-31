import { listChamados } from '@/http-pref-rio-cidadao/default/default'
import { NextResponse } from 'next/server'

export async function GET() {
  const result = await listChamados()

  const data =
    typeof result.data === 'string' ? JSON.parse(result.data) : result.data
  return NextResponse.json(data, { status: result.status })
}
