import { getCurriculoTermosAceitos } from '@/app/(app)/(logged-in-out)/servicos/(servicos)/trabalho/curriculo/get-curriculo-termos-data'
import { getExperienciaOptions } from '@/app/(app)/(logged-in-out)/servicos/(servicos)/trabalho/curriculo/get-experiencia-options'
import { getFormacaoOptions } from '@/app/(app)/(logged-in-out)/servicos/(servicos)/trabalho/curriculo/get-formacao-options'
import { getSituacaoOptions } from '@/app/(app)/(logged-in-out)/servicos/(servicos)/trabalho/curriculo/get-situacao-options'
import { getApiV1EmpregabilidadeCurriculoCpf } from '@/http-courses/empregabilidade-curriculo/empregabilidade-curriculo'
import type { ModelsCitizen } from '@/http/models'
import { getDalCitizenCpf } from '@/lib/dal'
import { convertMonthsToYearsAndMonths } from '@/lib/experiencia-utils'
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
    const normalizedCpf = cpf.replace(/\D/g, '')

    const [
      curriculoRes,
      termos,
      citizenResponse,
      formacaoOptions,
      situacaoOptions,
      experienciaOptions,
    ] = await Promise.all([
      getApiV1EmpregabilidadeCurriculoCpf(normalizedCpf),
      getCurriculoTermosAceitos(cpf),
      getDalCitizenCpf(cpf),
      getFormacaoOptions(),
      getSituacaoOptions(),
      getExperienciaOptions(),
    ])

    const curriculo =
      curriculoRes.status === 200 && curriculoRes.data
        ? (curriculoRes.data as Record<string, unknown>)
        : null

    const rawFormacoes = Array.isArray(curriculo?.formacoes)
      ? (curriculo.formacoes as Record<string, unknown>[])
      : []
    const formacoes = rawFormacoes.map(item => ({
      tipoFormacaoId: String(item.id_escolaridade ?? ''),
      nomeInstituicao: String(item.nome_instituicao ?? ''),
      nomeCurso: String(item.nome_curso ?? ''),
      status: String(item.status ?? ''),
      anoConclusao: String(item.ano_conclusao ?? ''),
    }))

    const rawIdiomas = Array.isArray(curriculo?.idiomas)
      ? (curriculo.idiomas as Record<string, unknown>[])
      : []
    const idiomas = rawIdiomas.map(item => ({
      idIdioma: String(item.id_idioma ?? ''),
      idNivel: String(item.id_nivel ?? ''),
    }))

    const rawExperiencias = Array.isArray(curriculo?.experiencias)
      ? (curriculo.experiencias as Record<string, unknown>[])
      : []
    const empregos = rawExperiencias.map(item => {
      const totalMonths =
        typeof item.tempo_experiencia_meses === 'number'
          ? item.tempo_experiencia_meses
          : undefined
      const converted = convertMonthsToYearsAndMonths(totalMonths)
      return {
        cargo: String(item.cargo ?? ''),
        meuEmpregoAtual: Boolean(item.eh_trabalho_atual),
        empresa: String(item.empresa ?? ''),
        descricaoAtividades: String(item.descricao_atividades ?? ''),
        tempoExperienciaAnos: converted?.anos ?? undefined,
        tempoExperienciaMeses: converted?.meses ?? undefined,
        experienciaComprovadaCarteira:
          item.experiencia_comprovada_ct === true
            ? 'Sim'
            : item.experiencia_comprovada_ct === false
              ? 'Não'
              : '',
      }
    })

    const rawConquistas = Array.isArray(curriculo?.conquistas)
      ? (curriculo.conquistas as Record<string, unknown>[])
      : []
    const conquistas = rawConquistas.map(item => ({
      idTipoConquista: String(item.id_tipo_conquista ?? ''),
      titulo: String(item.titulo ?? ''),
      descricao: String(item.descricao ?? ''),
    }))

    const experiencia = {
      empregos:
        empregos.length > 0
          ? empregos
          : [
              {
                cargo: '',
                meuEmpregoAtual: false,
                empresa: '',
                descricaoAtividades: '',
                tempoExperienciaAnos: undefined,
                tempoExperienciaMeses: undefined,
                experienciaComprovadaCarteira: '',
              },
            ],
      conquistas:
        conquistas.length > 0
          ? conquistas
          : [{ idTipoConquista: '', titulo: '', descricao: '' }],
    }

    const rawSituacao = curriculo?.situacao_interesses as
      | Record<string, unknown>
      | undefined
    const situacao = rawSituacao
      ? {
          idSituacao: String(rawSituacao.id_situacao ?? ''),
          tempoProcurandoEmprego: String(
            rawSituacao.tempo_procurando_emprego ?? ''
          ),
          idDisponibilidade: String(rawSituacao.id_disponibilidade ?? ''),
          idsTiposVinculo: Array.isArray(
            rawSituacao.ids_tipos_vinculo_preferencia
          )
            ? (rawSituacao.ids_tipos_vinculo_preferencia as unknown[])
                .map(id => String(id ?? ''))
                .filter(Boolean)
            : [],
          situacaoDescricao: String(
            (rawSituacao.situacao as Record<string, unknown> | undefined)
              ?.descricao ?? ''
          ),
        }
      : null

    const citizen =
      citizenResponse.status === 200 && citizenResponse.data
        ? (citizenResponse.data as ModelsCitizen)
        : null
    const escolaridade = citizen?.escolaridade?.trim() || undefined

    return NextResponse.json(
      {
        formacoes,
        idiomas,
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
