import { getApiV1EmpregabilidadeComportamentosAtitudes } from '@/http-courses/empregabilidade-comportamentos-atitudes/empregabilidade-comportamentos-atitudes'
import {
  getApiV1EmpregabilidadeCurriculoHabilidadesCompetencias,
  putApiV1EmpregabilidadeCurriculoHabilidadesCompetencias,
} from '@/http-courses/empregabilidade-curriculo-itens/empregabilidade-curriculo-itens'
import { getApiV1EmpregabilidadeHabilidadesAreasAtuacao } from '@/http-courses/empregabilidade-habilidades/empregabilidade-habilidades'
import { getUserInfoFromToken } from '@/lib/user-info'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  CatalogoIndisponivelError,
  type ItemCatalogo,
  listarCatalogoCompleto,
  normalizarItemCatalogo,
  normalizarItensCatalogo,
} from './catalogo'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

const idCatalogo = z.number().int().positive()

const payloadSchema = z
  .object({
    id_area_atuacao: idCatalogo.nullable(),
    habilidade_ids: z.array(idCatalogo).max(500),
    comportamento_atitudes_ids: z.array(idCatalogo).max(500),
  })
  .refine(
    payload =>
      payload.id_area_atuacao !== null || payload.habilidade_ids.length === 0,
    { message: 'Conhecimentos exigem uma área de atuação' }
  )

/** Comportamentos do catálogo, com os do currículo que faltarem nele. */
function mesclarComportamentos(
  catalogo: ItemCatalogo[],
  doCurriculo: ItemCatalogo[]
) {
  const idsCurriculo = new Set(doCurriculo.map(item => item.id))
  const idsCatalogo = new Set(catalogo.map(item => item.id))
  return [
    ...catalogo,
    ...doCurriculo.filter(item => !idsCatalogo.has(item.id)),
  ].map(item => ({ ...item, clicked: idsCurriculo.has(item.id) }))
}

export async function GET() {
  const userAuthInfo = await getUserInfoFromToken()
  if (!userAuthInfo.cpf) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const [areas, comportamentos, curriculoRes] = await Promise.all([
      listarCatalogoCompleto(params =>
        getApiV1EmpregabilidadeHabilidadesAreasAtuacao(params)
      ),
      listarCatalogoCompleto(params =>
        getApiV1EmpregabilidadeComportamentosAtitudes(params)
      ),
      getApiV1EmpregabilidadeCurriculoHabilidadesCompetencias(),
    ])

    // Sem a seleção atual, a tela mostraria o currículo vazio e o Salvar
    // apagaria o que o cidadão já tinha marcado: falha em vez de seguir.
    if (curriculoRes.status !== 200) {
      return NextResponse.json(
        { error: 'Erro ao carregar habilidades e competências' },
        {
          status: curriculoRes.status === 401 ? 401 : 502,
          headers: NO_CACHE_HEADERS,
        }
      )
    }

    const curriculo = curriculoRes.data

    return NextResponse.json(
      {
        areasAtuacao: areas,
        areaAtuacaoSelecionada: normalizarItemCatalogo(curriculo.area_atuacao),
        conhecimentosSelecionados: normalizarItensCatalogo(
          curriculo.conhecimentos ?? null
        ),
        comportamentoAtitudes: mesclarComportamentos(
          comportamentos,
          normalizarItensCatalogo(curriculo.comportamentos_atitudes ?? null)
        ),
      },
      { headers: NO_CACHE_HEADERS }
    )
  } catch (error) {
    console.error('Erro ao carregar habilidades e competências:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar habilidades e competências' },
      {
        status: error instanceof CatalogoIndisponivelError ? 502 : 500,
        headers: NO_CACHE_HEADERS,
      }
    )
  }
}

export async function PUT(request: Request) {
  const userAuthInfo = await getUserInfoFromToken()
  if (!userAuthInfo.cpf) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const parsed = payloadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  try {
    const response =
      await putApiV1EmpregabilidadeCurriculoHabilidadesCompetencias({
        id_area_atuacao: parsed.data.id_area_atuacao,
        habilidade_ids: [...new Set(parsed.data.habilidade_ids)],
        comportamento_atitudes_ids: [
          ...new Set(parsed.data.comportamento_atitudes_ids),
        ],
      })

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
