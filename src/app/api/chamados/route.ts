import { listChamados } from '@/http-pref-rio-cidadao/default/default'
import { isSalesforceServicesEnabled } from '@/lib/feature-flags'
import { parseJsonBody } from '@/lib/parse-json-body'
import { NextResponse } from 'next/server'

export async function GET() {
  if (!isSalesforceServicesEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const result = await listChamados()

  const data = parseJsonBody(result.data)
  return NextResponse.json(data, { status: result.status })
}
