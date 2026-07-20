'use server'

import { getFormacaoOptions } from '@/app/(app)/(logged-in-out)/servicos/(servicos)/trabalho/curriculo/get-formacao-options'

import { postApiV1EmpregabilidadeCandidaturas } from '@/http-courses/empregabilidade-candidaturas/empregabilidade-candidaturas'
import { getApiV1EmpregabilidadeCurriculoCpf } from '@/http-courses/empregabilidade-curriculo/empregabilidade-curriculo'
import { getApiPublicEmpregabilidadeVagasId } from '@/http-courses/empregabilidade-vagas-public/empregabilidade-vagas-public'
import { EmpregabilidadeStatusCandidatura } from '@/http-courses/models/empregabilidadeStatusCandidatura'
import type { ModelsCitizen } from '@/http/models'
import { getDalCitizenCpf } from '@/lib/dal'
import {
  checkEligibility,
  resolveEscolaridadeIdByDescricao,
} from '@/lib/eligibility-utils'
import type { FailedCriterio } from '@/lib/eligibility-utils'
import { getUserInfoFromToken } from '@/lib/user-info'

export interface RespostaInfoComplementar {
  id_info: string
  resposta: string
}

export interface EnviarCandidaturaResult {
  success: boolean
  error?: string
  /** Preenchido quando o candidato não atende aos critérios de elegibilidade. */
  failedCriterios?: FailedCriterio[]
}

/**
 * Envia a candidatura do usuário para uma vaga.
 *
 * Antes do POST, valida os critérios de elegibilidade com base no currículo
 * mais recente do candidato (já salvo). Se não passar, registra o bloqueio
 * via POST candidatura-bloqueios (fire-and-forget) e retorna failedCriterios.
 */
export async function enviarCandidatura(
  vagaId: string,
  respostasInfoComplementares?: RespostaInfoComplementar[]
): Promise<EnviarCandidaturaResult> {
  try {
    const userInfo = await getUserInfoFromToken()

    if (!userInfo.cpf) {
      return {
        success: false,
        error: 'CPF não encontrado. Faça login novamente.',
      }
    }

    const cpfLimpo = userInfo.cpf.replace(/\D/g, '')

    // Busca em paralelo: currículo fresco, vaga (critérios), referências e perfil do cidadão
    const [curriculoResponse, vagaResponse, formacaoOptions, cidadaoResponse] =
      await Promise.all([
        getApiV1EmpregabilidadeCurriculoCpf(cpfLimpo),
        getApiPublicEmpregabilidadeVagasId(vagaId),
        getFormacaoOptions(),
        getDalCitizenCpf(userInfo.cpf),
      ])

    if (curriculoResponse.status !== 200 || !curriculoResponse.data) {
      return {
        success: false,
        error: 'Não foi possível carregar seu currículo.',
      }
    }

    // Validação de elegibilidade com os dados frescos do currículo
    if (vagaResponse.status === 200 && vagaResponse.data) {
      const vaga = vagaResponse.data
      const curriculo = curriculoResponse.data as Record<string, unknown>

      const rawFormacoes = Array.isArray(curriculo.formacoes)
        ? (curriculo.formacoes as Array<{
            id_escolaridade?: string
            status?: string
          }>)
        : []

      const rawIdiomas = Array.isArray(curriculo.idiomas)
        ? (curriculo.idiomas as Array<{
            id_idioma?: string
            id_nivel?: string
          }>)
        : []

      const escolaridades = formacaoOptions.escolaridades

      const cidadao =
        cidadaoResponse.status === 200 && cidadaoResponse.data
          ? (cidadaoResponse.data as ModelsCitizen)
          : null

      const formacoesCurriculo = rawFormacoes
        .filter(f => f.id_escolaridade)
        .map(f => ({
          id_escolaridade: f.id_escolaridade!,
          status: f.status ?? '',
        }))

      const escolaridadeRmiId = resolveEscolaridadeIdByDescricao(
        cidadao?.escolaridade,
        escolaridades
      )

      const idiomasCurriculo = rawIdiomas
        .filter(i => i.id_idioma && i.id_nivel)
        .map(i => ({ id_idioma: i.id_idioma!, id_nivel: i.id_nivel! }))

      const eligibilityResult = checkEligibility({
        vaga,
        nascimentoData: cidadao?.nascimento?.data,
        formacoesCurriculo,
        escolaridadeRmiId,
        idiomasCurriculo,
        escolaridades,
        idiomas: formacaoOptions.idiomas,
        niveisIdioma: formacaoOptions.niveisIdioma,
      })

      if (!eligibilityResult.passes) {
        return {
          success: false,
          failedCriterios: eligibilityResult.failedCriterios,
        }
      }
    }

    const curriculoSnapshot = curriculoResponse.data

    const body = {
      id_vaga: vagaId,
      curriculo_snapshot: curriculoSnapshot,
      status: EmpregabilidadeStatusCandidatura.StatusCandidaturaEnviada,
      ...(respostasInfoComplementares &&
        respostasInfoComplementares.length > 0 && {
          respostas_info_complementares: respostasInfoComplementares,
        }),
    }

    const response = await postApiV1EmpregabilidadeCandidaturas(body)

    if (response.status === 201) {
      return { success: true }
    }

    if (response.status === 400 && response.data) {
      const data = response.data as { message?: string }
      return {
        success: false,
        error: data.message ?? 'Oops! Algo deu errado.',
      }
    }

    return {
      success: false,
      error: 'Não foi possível enviar sua candidatura.',
    }
  } catch (error) {
    console.error('Erro ao enviar candidatura:', error)
    return {
      success: false,
      error: 'Erro ao processar requisição.',
    }
  }
}
