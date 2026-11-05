import { getApiV1EmpregabilidadeHabilidadesAreasAtuacaoIdHabilidades } from '@/http-courses/empregabilidade-habilidades/empregabilidade-habilidades'
import { getUserInfoFromToken } from '@/lib/user-info'
import { NextResponse } from 'next/server'
import {
  CatalogoIndisponivelError,
  listarCatalogoCompleto,
} from '../../../catalogo'

/** Conhecimentos (habilidades) de uma área de atuação, para o currículo. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userAuthInfo = await getUserInfoFromToken()
  if (!userAuthInfo.cpf) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params
  const idArea = /^\d{1,15}$/.test(id) ? Number(id) : Number.NaN
  if (!Number.isSafeInteger(idArea) || idArea <= 0) {
    return NextResponse.json(
      { error: 'Área de atuação inválida' },
      { status: 400 }
    )
  }

  try {
    const conhecimentos = await listarCatalogoCompleto(paginacao =>
      getApiV1EmpregabilidadeHabilidadesAreasAtuacaoIdHabilidades(
        idArea,
        paginacao
      )
    )
    return NextResponse.json({ conhecimentos })
  } catch (error) {
    if (error instanceof CatalogoIndisponivelError && error.status === 404) {
      return NextResponse.json(
        { error: 'Área de atuação não encontrada' },
        { status: 404 }
      )
    }
    console.error('Erro ao carregar conhecimentos da área de atuação:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar conhecimentos da área de atuação' },
      { status: error instanceof CatalogoIndisponivelError ? 502 : 500 }
    )
  }
}
