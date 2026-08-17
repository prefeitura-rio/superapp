'use server'

import { deleteImovel } from '@/http-divida-ativa/imoveis/imoveis'
import { mapApiToMensagemErro } from '@/lib/divida-ativa-mappers'
import {
  isInscricaoImobiliariaValida,
  somenteDigitos,
} from '@/lib/divida-ativa-utils'
import { getUserInfoFromToken } from '@/lib/user-info'
import { revalidatePath } from 'next/cache'
import type { ResultadoAcaoDividaAtiva } from './resultado'

/**
 * Remove o vínculo de cadastro do imóvel no portal. Não altera nada nos sistemas fiscais —
 * a dívida continua existindo; o cidadão só deixa de ver o imóvel na lista dele.
 */
export async function excluirImovel(
  inscricao: string
): Promise<ResultadoAcaoDividaAtiva<null>> {
  const { cpf } = await getUserInfoFromToken()

  if (!cpf) {
    return { success: false, error: 'Usuário não autenticado', status: 401 }
  }

  if (!isInscricaoImobiliariaValida(inscricao)) {
    return {
      success: false,
      error: 'A inscrição imobiliária tem 7 ou 8 números.',
      status: 400,
    }
  }

  const response = await deleteImovel(somenteDigitos(inscricao))

  if (response.status !== 204) {
    return {
      success: false,
      error:
        mapApiToMensagemErro(response.data) ??
        'Não foi possível excluir o imóvel. Tente novamente mais tarde.',
      status: response.status,
    }
  }

  revalidatePath('/divida-ativa/imoveis')
  revalidatePath('/divida-ativa')

  return { success: true, data: null }
}
