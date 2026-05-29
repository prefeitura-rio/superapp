import { getApiPublicEmpregabilidadeVagas } from '@/http-courses/empregabilidade-vagas-public/empregabilidade-vagas-public'
import type {
  EmpregabilidadeVaga,
  GetApiPublicEmpregabilidadeVagasParams,
} from '@/http-courses/models'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

interface VagasApiResponse {
  data: EmpregabilidadeVaga[]
  meta: { page: number; page_size: number; total: number }
}

interface LookupItem {
  id?: string
  descricao?: string
}
interface LookupListResponse {
  data: LookupItem[]
}

const BASE_URL = (process.env.NEXT_PUBLIC_COURSES_BASE_API_URL ?? '').replace(
  /\/$/,
  ''
)

// Cache de módulo para os lookups (TTL de 10 minutos)
type LookupCache = { items: LookupItem[]; expiresAt: number }
let regimesCache: LookupCache | null = null
let modelosCache: LookupCache | null = null
const CACHE_TTL = 10 * 60 * 1000

async function fetchLookupWithAuth(path: string): Promise<LookupItem[]> {
  const url = `${BASE_URL}${path}?pageSize=100`
  if (!BASE_URL) return []
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value
  console.log('[VAGAS_LOOKUP] access_token present:', !!accessToken)
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
    })
    console.log('[VAGAS_LOOKUP] status HTTP:', res.status, path)
    if (!res.ok) {
      const text = await res.text()
      console.error('[VAGAS_LOOKUP] Resposta não-ok:', res.status, text)
      return []
    }
    const body: LookupListResponse = await res.json()
    console.log(
      '[VAGAS_LOOKUP] Itens retornados de',
      path,
      ':',
      JSON.stringify(body?.data)
    )
    return Array.isArray(body?.data) ? body.data : []
  } catch (err) {
    console.error('[VAGAS_LOOKUP] Erro ao buscar', path, err)
    return []
  }
}

async function fetchRegimes(): Promise<LookupItem[]> {
  const now = Date.now()
  if (regimesCache && regimesCache.expiresAt > now) return regimesCache.items
  const items = await fetchLookupWithAuth(
    '/api/v1/empregabilidade/regimes-contratacao'
  )
  if (items.length > 0) regimesCache = { items, expiresAt: now + CACHE_TTL }
  return items.length > 0 ? items : (regimesCache?.items ?? [])
}

async function fetchModelos(): Promise<LookupItem[]> {
  const now = Date.now()
  if (modelosCache && modelosCache.expiresAt > now) return modelosCache.items
  const items = await fetchLookupWithAuth(
    '/api/v1/empregabilidade/modelos-trabalho'
  )
  if (items.length > 0) modelosCache = { items, expiresAt: now + CACHE_TTL }
  return items.length > 0 ? items : (modelosCache?.items ?? [])
}

function matchUUIDs(items: LookupItem[], descricoes: string[]): string[] {
  const lower = descricoes.map(d => d.toLowerCase())
  return items
    .filter(
      i =>
        i.id &&
        i.descricao &&
        lower.some(d => i.descricao!.toLowerCase().includes(d))
    )
    .map(i => i.id!)
}

async function resolveRegimeUUIDs(descricoes: string[]): Promise<string[]> {
  if (descricoes.length === 0) return []
  try {
    return matchUUIDs(await fetchRegimes(), descricoes)
  } catch {
    return []
  }
}

async function resolveModeloUUIDs(descricoes: string[]): Promise<string[]> {
  if (descricoes.length === 0) return []
  try {
    return matchUUIDs(await fetchModelos(), descricoes)
  } catch {
    return []
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const base: GetApiPublicEmpregabilidadeVagasParams = {
    status: searchParams.get('status') ?? 'publicado_ativo',
    page: Number(searchParams.get('page') ?? 1),
    pageSize: Number(searchParams.get('pageSize') ?? 100),
    ...(searchParams.get('data_publicacao') && {
      data_publicacao: searchParams.get('data_publicacao') as string,
    }),
  }

  const regimeDescricoes = (searchParams.get('regime_descricao') ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  const modeloDescricoes = (searchParams.get('modelo_descricao') ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  const acessibilidades = (searchParams.get('acessibilidade_pcd') ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  const bairros = (searchParams.get('bairro') ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  const contratantes = (searchParams.get('contratante') ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  // Resolve descricoes → UUIDs em paralelo
  const [regimes, modelos] = await Promise.all([
    resolveRegimeUUIDs(regimeDescricoes),
    resolveModeloUUIDs(modeloDescricoes),
  ])

  // Se havia filtro de regime/modelo mas não resolveu nenhum UUID → sem resultados
  if (regimeDescricoes.length > 0 && regimes.length === 0) {
    return NextResponse.json({ data: [], meta: { total: 0 } })
  }
  if (modeloDescricoes.length > 0 && modelos.length === 0) {
    return NextResponse.json({ data: [], meta: { total: 0 } })
  }

  const params: GetApiPublicEmpregabilidadeVagasParams = {
    ...base,
    ...(regimes.length > 0 && { id_regime_contratacao: regimes.join(',') }),
    ...(modelos.length > 0 && { id_modelo_trabalho: modelos.join(',') }),
    ...(acessibilidades.length > 0 && {
      acessibilidade_pcd: acessibilidades.join(','),
    }),
    ...(bairros.length > 0 && { bairro: bairros.join(',') }),
    ...(contratantes.length > 0 && { contratante: contratantes.join(',') }),
  }

  try {
    const response = await getApiPublicEmpregabilidadeVagas(params)
    const body = response.data as unknown as VagasApiResponse
    const vagas: EmpregabilidadeVaga[] = Array.isArray(body?.data)
      ? body.data
      : []

    return NextResponse.json({ data: vagas, meta: { total: vagas.length } })
  } catch (error) {
    console.error('Erro ao buscar vagas:', error)
    return NextResponse.json({ data: [], meta: {} }, { status: 500 })
  }
}
