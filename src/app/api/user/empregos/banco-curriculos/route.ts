import type { BancoCurriculosStatus } from '@/app/components/empregos/area-candidato/area-candidato-utils'
import {
  getApiV1EmpregabilidadeCurriculoCpfBancoCurriculos,
  putApiV1EmpregabilidadeCurriculoCpfBancoCurriculos,
} from '@/http-courses/empregabilidade-curriculo-banco/empregabilidade-curriculo-banco'
import type {
  EmpregabilidadeParticipacaoBancoStatus,
  PutApiV1EmpregabilidadeCurriculoCpfBancoCurriculos422,
} from '@/http-courses/models'
import type { ModelsCitizen } from '@/http/models'
import { getDalCitizenCpf } from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'
import { type NextRequest, NextResponse } from 'next/server'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

const DESLOGADO: BancoCurriculosStatus = {
  logado: false,
  temCurriculo: false,
  curriculoCompleto: false,
  pendencias: [],
  curriculoAtualizadoEm: null,
  disponivel: false,
}

const ESCOLARIDADE_PENDENTE = 'Escolaridade não informada'

/**
 * A API não exige a escolaridade (vem do cadastro, não do currículo), mas o
 * app exige para se candidatar, então ela conta para o "Termine de preencher".
 * Não impede a participação no banco, que mostra o que a pessoa salvou.
 */
async function escolaridadeInformada(cpf: string): Promise<boolean> {
  try {
    const res = await getDalCitizenCpf(cpf)
    const citizen = res.status === 200 ? (res.data as ModelsCitizen) : null
    return Boolean(citizen?.escolaridade?.trim())
  } catch {
    return false
  }
}

function montarStatus(
  api: EmpregabilidadeParticipacaoBancoStatus,
  temEscolaridade: boolean
): BancoCurriculosStatus {
  const pendencias = [...(api.pendencias ?? [])]
  if (!temEscolaridade) pendencias.push(ESCOLARIDADE_PENDENTE)
  return {
    logado: true,
    temCurriculo: Boolean(api.tem_curriculo),
    curriculoCompleto: pendencias.length === 0,
    pendencias,
    curriculoAtualizadoEm: api.curriculo_atualizado_em ?? null,
    disponivel: Boolean(api.disponivel),
  }
}

async function cpfDoUsuario(): Promise<string | null> {
  const { cpf } = await getUserInfoFromToken()
  return cpf ? cpf.replace(/\D/g, '') : null
}

export async function GET() {
  try {
    const cpf = await cpfDoUsuario()
    if (!cpf) return NextResponse.json(DESLOGADO, { headers: NO_CACHE_HEADERS })

    const [res, temEscolaridade] = await Promise.all([
      getApiV1EmpregabilidadeCurriculoCpfBancoCurriculos(cpf),
      escolaridadeInformada(cpf),
    ])
    if (res.status !== 200) {
      return NextResponse.json(
        { error: 'Não foi possível consultar o banco de currículos' },
        { status: 502, headers: NO_CACHE_HEADERS }
      )
    }

    return NextResponse.json(
      montarStatus(
        res.data as EmpregabilidadeParticipacaoBancoStatus,
        temEscolaridade
      ),
      { headers: NO_CACHE_HEADERS }
    )
  } catch (error) {
    console.error('Error in banco-curriculos GET route:', error)
    return NextResponse.json(
      { error: 'Não foi possível consultar o banco de currículos' },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cpf = await cpfDoUsuario()
    if (!cpf) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401, headers: NO_CACHE_HEADERS }
      )
    }

    const body = (await request.json().catch(() => null)) as {
      disponivel?: unknown
    } | null
    if (typeof body?.disponivel !== 'boolean') {
      return NextResponse.json(
        { error: 'Informe se o currículo fica disponível' },
        { status: 400, headers: NO_CACHE_HEADERS }
      )
    }

    const [res, temEscolaridade] = await Promise.all([
      putApiV1EmpregabilidadeCurriculoCpfBancoCurriculos(cpf, {
        disponivel: body.disponivel,
      }),
      escolaridadeInformada(cpf),
    ])
    // Quem ainda não salvou nenhuma parte do currículo não tem o que ocultar.
    if (res.status === 422) {
      const recusa =
        res.data as PutApiV1EmpregabilidadeCurriculoCpfBancoCurriculos422
      return NextResponse.json(
        { error: recusa.error },
        { status: 422, headers: NO_CACHE_HEADERS }
      )
    }
    if (res.status !== 200) {
      return NextResponse.json(
        { error: 'Não foi possível atualizar o banco de currículos' },
        { status: 502, headers: NO_CACHE_HEADERS }
      )
    }

    return NextResponse.json(
      montarStatus(
        res.data as EmpregabilidadeParticipacaoBancoStatus,
        temEscolaridade
      ),
      { headers: NO_CACHE_HEADERS }
    )
  } catch (error) {
    console.error('Error in banco-curriculos PUT route:', error)
    return NextResponse.json(
      { error: 'Não foi possível atualizar o banco de currículos' },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}
