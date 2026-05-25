import { getApiV1EmpregabilidadeEmpresas } from '@/http-courses/empregabilidade-empresas/empregabilidade-empresas'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const params = {
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    pageSize: searchParams.get('page_size')
      ? Number(searchParams.get('page_size'))
      : 10,
    search: searchParams.get('search')?.trim() || undefined,
    cnpj: searchParams.get('cnpj')?.trim() || undefined,
  }

  try {
    const response = await getApiV1EmpregabilidadeEmpresas(params)

    if (response.status === 200) {
      return NextResponse.json(response.data)
    }

    return NextResponse.json(
      { data: [], meta: {} },
      { status: response.status }
    )
  } catch (error) {
    console.error('Erro ao buscar empresas:', error)
    return NextResponse.json({ data: [], meta: {} }, { status: 500 })
  }
}
