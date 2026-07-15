'use server'

import { getFormacaoOptions } from '@/app/(app)/(logged-in-out)/servicos/(servicos)/trabalho/curriculo/get-formacao-options'
import { postApiV1EmpregabilidadeCandidaturaBloqueios } from '@/http-courses/empregabilidade-candidatura-bloqueios/empregabilidade-candidatura-bloqueios'
import { postApiV1EmpregabilidadeCandidaturas } from '@/http-courses/empregabilidade-candidaturas/empregabilidade-candidaturas'
import { getApiV1EmpregabilidadeCurriculoCpf } from '@/http-courses/empregabilidade-curriculo/empregabilidade-curriculo'
import { getApiPublicEmpregabilidadeVagasId } from '@/http-courses/empregabilidade-vagas-public/empregabilidade-vagas-public'
import { EmpregabilidadeStatusCandidatura } from '@/http-courses/models/empregabilidadeStatusCandidatura'
import type { ModelsCitizen } from '@/http/models'
import { getDalCitizenCpf } from '@/lib/dal'
import { checkEligibility } from '@/lib/eligibility-utils'
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
        ? (curriculo.formacoes as Array<{ id_escolaridade?: string }>)
        : []

      const rawIdiomas = Array.isArray(curriculo.idiomas)
        ? (curriculo.idiomas as Array<{
            id_idioma?: string
            id_nivel?: string
          }>)
        : []

      const escolaridades = formacaoOptions.escolaridades
      const melhorEscolaridadeId = rawFormacoes
        .map(f => f.id_escolaridade ?? '')
        .filter(Boolean)
        .reduce<string | undefined>((melhor, id) => {
          if (!melhor) return id
          const idxMelhor = escolaridades.findIndex(e => e.id === melhor)
          const idxAtual = escolaridades.findIndex(e => e.id === id)
          return idxAtual > idxMelhor ? id : melhor
        }, undefined)

      const idiomasCurriculo = rawIdiomas
        .filter(i => i.id_idioma && i.id_nivel)
        .map(i => ({ id_idioma: i.id_idioma!, id_nivel: i.id_nivel! }))

      const cidadao =
        cidadaoResponse.status === 200 && cidadaoResponse.data
          ? (cidadaoResponse.data as ModelsCitizen)
          : null

      const eligibilityResult = checkEligibility({
        vaga,
        nascimentoData: cidadao?.nascimento?.data,
        melhorEscolaridadeId,
        idiomasCurriculo,
        escolaridades,
        idiomas: formacaoOptions.idiomas,
        niveisIdioma: formacaoOptions.niveisIdioma,
      })

      if (!eligibilityResult.passes) {
        // Fire-and-forget: registra o bloqueio sem bloquear o retorno ao client
        const bloqueioPayload = {
          cpf: cpfLimpo,
          id_vaga: vagaId,
          criterios_nao_atendidos: eligibilityResult.failedCriterios.map(
            c => c.slug
          ),
        }
        console.log(
          '[enviarCandidatura] Registrando bloqueio:',
          JSON.stringify(bloqueioPayload)
        )
        postApiV1EmpregabilidadeCandidaturaBloqueios(bloqueioPayload)
          .then(r =>
            console.log(
              '[enviarCandidatura] Bloqueio registrado, status:',
              r.status
            )
          )
          .catch(err =>
            console.error(
              '[enviarCandidatura] Erro ao registrar bloqueio:',
              err
            )
          )

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

    console.log('[enviarCandidatura] payload:', JSON.stringify(body, null, 2))

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
