import { getApiV1EmpregabilidadeComportamentosAtitudes } from '@/http-courses/empregabilidade-comportamentos-atitudes/empregabilidade-comportamentos-atitudes'
import { putApiV1EmpregabilidadeCurriculo } from '@/http-courses/empregabilidade-curriculo-itens/empregabilidade-curriculo-itens'
import { getApiV1EmpregabilidadeCurriculoCpf } from '@/http-courses/empregabilidade-curriculo/empregabilidade-curriculo'
import { getApiV1EmpregabilidadeHabilidadesAreasAtuacaoHabilidades } from '@/http-courses/empregabilidade-habilidades/empregabilidade-habilidades'
import type { EmpregabilidadeCurriculoItensReplaceAll } from '@/http-courses/models'
import { getUserInfoFromToken } from '@/lib/user-info'
import { NextResponse } from 'next/server'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

export async function GET() {
  const userAuthInfo = await getUserInfoFromToken()
  if (!userAuthInfo.cpf) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const cpf = userAuthInfo.cpf.replace(/\D/g, '')
    const [areasRes, comportamentosRes, curriculoRes] = await Promise.all([
      getApiV1EmpregabilidadeHabilidadesAreasAtuacaoHabilidades(),
      getApiV1EmpregabilidadeComportamentosAtitudes({ page: 1, pageSize: 20 }),
      getApiV1EmpregabilidadeCurriculoCpf(cpf),
    ])

    const curriculo =
      curriculoRes.status === 200 && curriculoRes.data
        ? (curriculoRes.data as unknown as Record<string, unknown>)
        : null

    const idsAreasHabilidadesCurriculo = new Set(
      (Array.isArray(curriculo?.area_atuacao_habilidade)
        ? (curriculo.area_atuacao_habilidade as Record<string, unknown>[])
        : []
      ).map(item => Number(item.id_area_atuacao_habilidade ?? item.id))
    )

    const catalogoAreas =
      areasRes.status === 200 && Array.isArray(areasRes.data)
        ? areasRes.data
        : []

    const areasMap = new Map<
      number,
      {
        nome: string
        vinculos: { idTupla: number; nome: string; checked: boolean }[]
        checked: boolean
      }
    >()

    for (const item of catalogoAreas) {
      const idArea = Number(item.id_area_atuacao ?? item.area_atuacao?.id ?? 0)
      const idTupla = Number(item.id ?? 0)
      if (!idArea || !idTupla) continue

      const area = areasMap.get(idArea) ?? {
        nome: item.area_atuacao?.nome ?? '',
        vinculos: [],
        checked: false,
      }
      const checked = idsAreasHabilidadesCurriculo.has(idTupla)
      area.vinculos.push({
        idTupla,
        nome: item.habilidade?.nome ?? '',
        checked,
      })
      area.checked ||= checked
      areasMap.set(idArea, area)
    }

    const idsComportamentosCurriculo = new Set(
      (Array.isArray(curriculo?.comportamento_atitudes)
        ? (curriculo.comportamento_atitudes as Record<string, unknown>[])
        : []
      ).map(item => Number(item.id_comportamento_atitudes ?? item.id))
    )

    const catalogoComportamentos =
      comportamentosRes.status === 200 &&
      Array.isArray(comportamentosRes.data?.data)
        ? comportamentosRes.data.data
        : []

    return NextResponse.json(
      {
        areasAtuacao: Array.from(areasMap.values()),
        comportamentoAtitudes: catalogoComportamentos.map(item => ({
          id: Number(item.id ?? 0),
          nome: item.nome ?? '',
          clicked: idsComportamentosCurriculo.has(Number(item.id ?? 0)),
        })),
      },
      { headers: NO_CACHE_HEADERS }
    )
  } catch (error) {
    console.error('Erro ao carregar habilidades e competências:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar habilidades e competências' },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}

export async function PUT(request: Request) {
  const userAuthInfo = await getUserInfoFromToken()
  if (!userAuthInfo.cpf) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const payload =
      (await request.json()) as EmpregabilidadeCurriculoItensReplaceAll
    const response = await putApiV1EmpregabilidadeCurriculo(payload)

    if (response.status !== 200) {
      return NextResponse.json(response.data, { status: response.status })
    }

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Erro ao atualizar habilidades e competências:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar habilidades e competências' },
      { status: 500 }
    )
  }
}
