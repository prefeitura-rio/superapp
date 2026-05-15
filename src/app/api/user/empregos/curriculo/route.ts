import { getCurriculoExperienciaData } from '@/app/(app)/(logged-in-out)/servicos/(servicos)/empregos/curriculo/get-curriculo-experiencia-data'
import { getCurriculoFormacaoData } from '@/app/(app)/(logged-in-out)/servicos/(servicos)/empregos/curriculo/get-curriculo-formacao-data'
import { getCurriculoSituacaoData } from '@/app/(app)/(logged-in-out)/servicos/(servicos)/empregos/curriculo/get-curriculo-situacao-data'
import { getCurriculoTermosAceitos } from '@/app/(app)/(logged-in-out)/servicos/(servicos)/empregos/curriculo/get-curriculo-termos-data'
import { getExperienciaOptions } from '@/app/(app)/(logged-in-out)/servicos/(servicos)/empregos/curriculo/get-experiencia-options'
import { getFormacaoOptions } from '@/app/(app)/(logged-in-out)/servicos/(servicos)/empregos/curriculo/get-formacao-options'
import { getSituacaoOptions } from '@/app/(app)/(logged-in-out)/servicos/(servicos)/empregos/curriculo/get-situacao-options'
import type { ModelsCitizen } from '@/http/models'
import { getDalCitizenCpf } from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'
import { NextResponse } from 'next/server'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

const EMPTY_RESPONSE = {
  formacoes: [],
  idiomas: [],
  situacao: null,
  experiencia: null,
  termos: false,
  escolaridade: undefined,
  formacaoOptions: { escolaridades: [], idiomas: [], niveisIdioma: [] },
  situacaoOptions: {
    situacoesAtual: [],
    disponibilidades: [],
    regimesContratacao: [],
  },
  experienciaOptions: { tiposConquista: [] },
}

export async function GET() {
  try {
    const userAuthInfo = await getUserInfoFromToken()

    if (!userAuthInfo.cpf) {
      return NextResponse.json(EMPTY_RESPONSE, { headers: NO_CACHE_HEADERS })
    }

    const cpf = userAuthInfo.cpf

    const [
      formacaoData,
      situacao,
      experiencia,
      termos,
      citizenResponse,
      formacaoOptions,
      situacaoOptions,
      experienciaOptions,
    ] = await Promise.all([
      getCurriculoFormacaoData(cpf),
      getCurriculoSituacaoData(cpf),
      getCurriculoExperienciaData(cpf),
      getCurriculoTermosAceitos(cpf),
      getDalCitizenCpf(cpf),
      getFormacaoOptions(),
      getSituacaoOptions(),
      getExperienciaOptions(),
    ])

    const citizen =
      citizenResponse.status === 200 && citizenResponse.data
        ? (citizenResponse.data as ModelsCitizen)
        : null
    const escolaridade = citizen?.escolaridade?.trim() || undefined

    return NextResponse.json(
      {
        formacoes: formacaoData.formacoes,
        idiomas: formacaoData.idiomas,
        situacao,
        experiencia,
        termos,
        escolaridade,
        formacaoOptions,
        situacaoOptions,
        experienciaOptions,
      },
      { headers: NO_CACHE_HEADERS }
    )
  } catch (error) {
    console.error('Error in curriculo API route:', error)
    return NextResponse.json(EMPTY_RESPONSE, {
      status: 500,
      headers: NO_CACHE_HEADERS,
    })
  }
}
