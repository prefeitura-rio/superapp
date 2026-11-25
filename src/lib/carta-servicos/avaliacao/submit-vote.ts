import { postArticleVote } from '@/http-pref-rio-carta-votacao/default/default'
import type { ServiceRatingErrorCode, ServiceRatingRequest } from './request'
import { toVoteRequest } from './request'

export type SubmitVoteResult =
  | { ok: true }
  | { ok: false; status: number; code: ServiceRatingErrorCode }

/**
 * Envia o voto ao Apex e traduz a resposta para o contrato da rota do portal.
 * Nenhuma mensagem do Salesforce chega ao cidadão: o componente só recebe um
 * código estável e mostra uma mensagem neutra.
 */
export async function submitVote(
  slug: string,
  input: ServiceRatingRequest,
  voterToken: string
): Promise<SubmitVoteResult> {
  try {
    const response = await postArticleVote(
      slug,
      toVoteRequest(input, voterToken)
    )

    switch (response.status) {
      case 200:
        return { ok: true }
      case 400:
        console.error('[avaliacao-servico] voto rejeitado pelo Apex', {
          slug,
          code: response.data.error?.code,
          message: response.data.error?.message,
        })
        return { ok: false, status: 400, code: 'invalid_payload' }
      case 404:
        return { ok: false, status: 404, code: 'not_found' }
      default:
        // 401 que sobrou depois da renovação do token, 403 (REQUEST_LIMIT_EXCEEDED),
        // 500 (INTERNAL_ERROR) e 503: falha neutra, sem repetir a chamada.
        console.error('[avaliacao-servico] falha no Salesforce', {
          slug,
          status: response.status,
          errorCode: Array.isArray(response.data)
            ? response.data.map(item => item.errorCode).join(',')
            : response.data.error?.code,
        })
        return { ok: false, status: 503, code: 'unavailable' }
    }
  } catch (error) {
    console.error('[avaliacao-servico] erro ao chamar o Salesforce', {
      slug,
      error: error instanceof Error ? error.message : String(error),
    })
    return { ok: false, status: 503, code: 'unavailable' }
  }
}
