'use server'

import { postApiV1EmpregabilidadeCandidaturas } from '@/http-courses/empregabilidade-candidaturas/empregabilidade-candidaturas'
import { getApiV1EmpregabilidadeCurriculoCpf } from '@/http-courses/empregabilidade-curriculo/empregabilidade-curriculo'
import { EmpregabilidadeStatusCandidatura } from '@/http-courses/models/empregabilidadeStatusCandidatura'
import { getUserInfoFromToken } from '@/lib/user-info'

export interface RespostaInfoComplementar {
  id_info: string
  resposta: string
}

export interface EnviarCandidaturaResult {
  success: boolean
  error?: string
}

/**
 * Envia a candidatura do usuário para uma vaga.
 * Busca o currículo completo pelo CPF (token) e chama o endpoint de criação de candidatura.
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

    const curriculoResponse = await getApiV1EmpregabilidadeCurriculoCpf(
      userInfo.cpf
    )

    if (curriculoResponse.status !== 200 || !curriculoResponse.data) {
      return {
        success: false,
        error: 'Não foi possível carregar seu currículo.',
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
