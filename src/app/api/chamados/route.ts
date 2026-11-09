import { listChamados } from '@/http-pref-rio-cidadao/default/default'
import { parseJsonBody } from '@/lib/parse-json-body'
import { NextResponse } from 'next/server'

export async function GET() {
  const result = await listChamados()

  const data = parseJsonBody(result.data)
  return NextResponse.json(data, { status: result.status })
}
