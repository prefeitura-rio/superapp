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

const MAX_PARALLEL = 5

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

/**
 * Expande filtros multi-valor em múltiplos conjuntos de params (produto cartesiano).
 * Limitado a MAX_PARALLEL requisições.
 */
function expandParams(
  base: GetApiPublicEmpregabilidadeVagasParams,
  regimes: string[],
  modelos: string[],
  acessibilidades: string[],
  bairros: string[],
  contratantes: string[]
): GetApiPublicEmpregabilidadeVagasParams[] {
  const r = regimes.length > 0 ? regimes : [undefined]
  const m = modelos.length > 0 ? modelos : [undefined]
  const a = acessibilidades.length > 0 ? acessibilidades : [undefined]
  const b = bairros.length > 0 ? bairros : [undefined]
  const c = contratantes.length > 0 ? contratantes : [undefined]

  const combos: GetApiPublicEmpregabilidadeVagasParams[] = []

  outer: for (const regime of r) {
    for (const modelo of m) {
      for (const acess of a) {
        for (const bairro of b) {
          for (const contratante of c) {
            combos.push({
              ...base,
              ...(regime !== undefined && { id_regime_contratacao: regime }),
              ...(modelo !== undefined && { id_modelo_trabalho: modelo }),
              ...(acess !== undefined && { acessibilidade_pcd: acess }),
              ...(bairro !== undefined && { bairro }),
              ...(contratante !== undefined && { contratante }),
            })
            if (combos.length >= MAX_PARALLEL) break outer
          }
        }
      }
    }
  }

  return combos
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

  const regimeDescricoes = searchParams
    .getAll('regime_descricao')
    .filter(Boolean)
  const modeloDescricoes = searchParams
    .getAll('modelo_descricao')
    .filter(Boolean)
  const acessibilidades = searchParams
    .getAll('acessibilidade_pcd')
    .filter(Boolean)
  const bairros = searchParams.getAll('bairro').filter(Boolean)
  const contratantes = searchParams.getAll('contratante').filter(Boolean)

  console.log('[VAGAS] modeloDescricoes recebidos:', modeloDescricoes)
  console.log('[VAGAS] regimeDescricoes recebidos:', regimeDescricoes)

  // Resolve descricoes → UUIDs em paralelo (lê access_token via cookies())
  const [regimes, modelos] = await Promise.all([
    resolveRegimeUUIDs(regimeDescricoes),
    resolveModeloUUIDs(modeloDescricoes),
  ])

  console.log('[VAGAS] regimes UUIDs resolvidos:', regimes)
  console.log('[VAGAS] modelos UUIDs resolvidos:', modelos)

  // Se havia filtro de regime/modelo mas não resolveu nenhum UUID → sem resultados
  if (regimeDescricoes.length > 0 && regimes.length === 0) {
    console.warn('[VAGAS] regime não resolveu UUID, retornando vazio')
    return NextResponse.json({ data: [], meta: { total: 0 } })
  }
  if (modeloDescricoes.length > 0 && modelos.length === 0) {
    console.warn('[VAGAS] modalidade não resolveu UUID, retornando vazio')
    return NextResponse.json({ data: [], meta: { total: 0 } })
  }

  const paramSets = expandParams(
    base,
    regimes,
    modelos,
    acessibilidades,
    bairros,
    contratantes
  )
  console.log('[VAGAS] paramSets expandidos:', JSON.stringify(paramSets))

  try {
    const responses = await Promise.all(
      paramSets.map(params => getApiPublicEmpregabilidadeVagas(params))
    )

    // Mescla e deduplica por id
    const seen = new Set<string>()
    const merged: EmpregabilidadeVaga[] = []

    for (const res of responses) {
      if (res.status !== 200) continue
      const body = res.data as unknown as VagasApiResponse
      const vagas = Array.isArray(body?.data) ? body.data : []
      for (const vaga of vagas) {
        if (vaga.id && !seen.has(vaga.id)) {
          seen.add(vaga.id)
          merged.push(vaga)
        }
      }
    }

    return NextResponse.json({ data: merged, meta: { total: merged.length } })
  } catch (error) {
    console.error('Erro ao buscar vagas:', error)
    return NextResponse.json({ data: [], meta: {} }, { status: 500 })
  }
}
