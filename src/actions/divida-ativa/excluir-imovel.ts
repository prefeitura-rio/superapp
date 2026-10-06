'use server'

import { deleteImoveisId } from '@/http-divida-ativa/imoveis/imoveis'
import { mapApiToMensagemErro } from '@/lib/divida-ativa-mappers'
import { getUserInfoFromToken } from '@/lib/user-info'
import { revalidatePath } from 'next/cache'
import type { ResultadoAcaoDividaAtiva } from './resultado'

/**
 * Remove o vínculo de cadastro do imóvel no portal. Não altera nada nos sistemas fiscais —
 * a dívida continua existindo; o cidadão só deixa de ver o imóvel na lista dele.
 *
 * Recebe o **id local** do cadastro (`dbo.tbNC_Imovel`), não a inscrição imobiliária: é
 * assim que a API real identifica o registro a remover. A API confere sozinha se o id
 * pertence ao CPF do token e devolve 404 quando não pertence.
 */
export async function excluirImovel(
  id: number
): Promise<ResultadoAcaoDividaAtiva<null>> {
  const { cpf } = await getUserInfoFromToken()

  if (!cpf) {
    return { success: false, error: 'Usuário não autenticado', status: 401 }
  }

  if (!Number.isInteger(id) || id <= 0) {
    return {
      success: false,
      error: 'Não foi possível identificar o imóvel a excluir.',
      status: 400,
    }
  }

  const response = await deleteImoveisId(id)

  if (response.status !== 204) {
    return {
      success: false,
      error:
        mapApiToMensagemErro(response.data, response.status) ??
        'Não foi possível excluir o imóvel. Tente novamente mais tarde.',
      status: response.status,
    }
  }

  revalidatePath('/divida-ativa/imoveis')
  revalidatePath('/divida-ativa')

  return { success: true, data: null }
}
