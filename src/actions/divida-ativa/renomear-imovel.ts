'use server'

import { NOME_IMOVEL_TAMANHO_MAXIMO } from '@/app/components/divida-ativa/nome-imovel-schema'
import { patchImoveisId } from '@/http-divida-ativa/imoveis/imoveis'
import {
  mapApiToImovel,
  mapApiToMensagemErro,
} from '@/lib/divida-ativa-mappers'
import { getUserInfoFromToken } from '@/lib/user-info'
import type { ImovelDividaAtiva } from '@/types/divida-ativa'
import { revalidatePath } from 'next/cache'
import type { ResultadoAcaoDividaAtiva } from './resultado'

/**
 * Troca o nome de um imóvel já cadastrado.
 *
 * Recebe o **id local** do cadastro (`dbo.tbNC_Imovel`), como a exclusão — a API não
 * renomeia pela inscrição. É ela quem confere se o id pertence ao CPF do token, e devolve
 * 404 quando não pertence: o front não tem como saber, e não deve fingir que sabe.
 *
 * Só o nome muda. Inscrição e endereço vêm do `WSFazenda_Iptu` e o contrato não os aceita
 * na edição — trocar a inscrição faria dele outro imóvel, o que é excluir e cadastrar.
 */
export async function renomearImovel(
  id: number,
  nome?: string
): Promise<ResultadoAcaoDividaAtiva<ImovelDividaAtiva>> {
  const { cpf } = await getUserInfoFromToken()

  if (!cpf) {
    return { success: false, error: 'Usuário não autenticado', status: 401 }
  }

  if (!Number.isInteger(id) || id <= 0) {
    return {
      success: false,
      error: 'Não foi possível identificar o imóvel a renomear.',
      status: 400,
    }
  }

  const nomeNormalizado = nome?.trim()

  if (nomeNormalizado && nomeNormalizado.length > NOME_IMOVEL_TAMANHO_MAXIMO) {
    return {
      success: false,
      error: `O nome pode ter no máximo ${NOME_IMOVEL_TAMANHO_MAXIMO} caracteres.`,
      status: 400,
    }
  }

  // Diferente do cadastro, aqui a chave vai **sempre**, inclusive vazia: no `POST` ausente
  // significa "não escolhi nome", mas no `PATCH` significa "apague o nome que eu tinha".
  // Omitir a chave tornaria impossível desfazer um nome dado por engano.
  const response = await patchImoveisId(id, { nome: nomeNormalizado ?? '' })

  if (response.status !== 200) {
    return {
      success: false,
      error:
        mapApiToMensagemErro(response.data, response.status) ??
        'Não foi possível renomear o imóvel. Tente novamente mais tarde.',
      status: response.status,
    }
  }

  revalidatePath('/divida-ativa/imoveis')
  revalidatePath('/divida-ativa')

  return { success: true, data: mapApiToImovel(response.data) }
}
