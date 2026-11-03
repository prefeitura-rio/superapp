'use server'

import { postDividaAtivaAvistaEmitir } from '@/http-divida-ativa/divida-ativa-requerimentos/divida-ativa-requerimentos'
import { mapApiToMensagemErro } from '@/lib/divida-ativa-mappers'
import { urlPdfDaPrefeitura } from '@/lib/divida-ativa-utils'
import { getUserInfoFromToken } from '@/lib/user-info'
import type { ResultadoAcaoDividaAtiva } from './resultado'

const ERRO_GENERICO =
  'Não foi possível emitir a guia agora. Tente novamente em alguns minutos.'

/**
 * "Imprimir Guia a Vista" da revisão: emite a guia à vista das CDAs e devolve a URL do PDF no
 * DAM Internet — o mesmo que o portal legado abre.
 *
 * `dataVencimento` é a que a revisão usou para calcular os valores na tela: emitir com outra
 * data geraria uma guia com descontos diferentes dos que o cidadão acabou de ver.
 *
 * ⚠️ **Cada chamada cria uma guia no DAM.** Quem chama tem de impedir o clique duplo.
 *
 * A guia pode sair sem PDF (o DAM emitiu, o relatório falhou). Ela existe e pode ser paga, então
 * isso não é sucesso nem erro genérico: vira erro com o número da guia para o cidadão.
 */
export async function emitirGuiaAvista(
  cdas: string[],
  dataVencimento: string | null
): Promise<ResultadoAcaoDividaAtiva<{ urlPdf: string }>> {
  const { cpf } = await getUserInfoFromToken()

  if (!cpf) {
    return { success: false, error: 'Usuário não autenticado', status: 401 }
  }

  if (cdas.length === 0) {
    return {
      success: false,
      error: 'Selecione ao menos um débito para emitir a guia.',
      status: 400,
    }
  }

  const response = await postDividaAtivaAvistaEmitir(
    { cdas, dataVencimento: dataVencimento ?? undefined },
    { cache: 'no-store' }
  )

  if (response.status !== 200) {
    return {
      success: false,
      error:
        mapApiToMensagemErro(response.data, response.status) ?? ERRO_GENERICO,
      status: response.status,
    }
  }

  const { numeroGuia } = response.data
  // Link fora do domínio da Prefeitura não vai para a tela: vale como guia sem PDF.
  const urlPdf = urlPdfDaPrefeitura(response.data.urlPdf)

  if (!urlPdf) {
    return {
      success: false,
      error: numeroGuia
        ? // "Imprimir de novo" criaria outra guia; esta já existe e sai pela 2ª via.
          `A guia ${numeroGuia} foi emitida, mas o PDF não ficou pronto. Você pode obtê-la pela segunda via de guia.`
        : ERRO_GENERICO,
      status: 502,
    }
  }

  return { success: true, data: { urlPdf } }
}
