'use server'

import { NOME_IMOVEL_TAMANHO_MAXIMO } from '@/app/components/divida-ativa/nome-imovel-schema'
import { postImoveis } from '@/http-divida-ativa/imoveis/imoveis'
import {
  mapApiToImovel,
  mapApiToMensagemErro,
} from '@/lib/divida-ativa-mappers'
import {
  isInscricaoImobiliariaValida,
  somenteDigitos,
} from '@/lib/divida-ativa-utils'
import { getUserInfoFromToken } from '@/lib/user-info'
import type { ImovelDividaAtiva } from '@/types/divida-ativa'
import { revalidatePath } from 'next/cache'
import type { ResultadoAcaoDividaAtiva } from './resultado'

/**
 * Cadastra o imóvel no portal.
 *
 * ⚠️ **Este endpoint consulta e grava no mesmo passo.** `POST /imoveis` chama o
 * `WSFazenda_Iptu` para descobrir o endereço da inscrição e grava o registro local — não
 * existe um modo "só consultar". É o comportamento do portal legado, e é a razão pela
 * qual a premissa P20 está em aberto: a tela "Confirme sua inscrição" pressupunha uma
 * consulta prévia que a API não oferece. Ver `docs/divida-ativa.md`.
 *
 * O vínculo com o cidadão é feito pela API a partir do Bearer token: nada de CPF no corpo.
 */
export async function adicionarImovel(
  inscricao: string,
  nome?: string
): Promise<ResultadoAcaoDividaAtiva<ImovelDividaAtiva>> {
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

  if (nome && nome.trim().length > NOME_IMOVEL_TAMANHO_MAXIMO) {
    return {
      success: false,
      error: `O nome pode ter no máximo ${NOME_IMOVEL_TAMANHO_MAXIMO} caracteres.`,
      status: 400,
    }
  }

  // ⚠️ O `nome` chega até aqui e é descartado: `ImovelRequest` só aceita `numInscricao`
  // (premissa P23 em `docs/divida-ativa.md`). Quando o contrato ganhar o campo, inclua-o
  // no corpo abaixo — o resto do fluxo já o transporta.
  const response = await postImoveis({
    numInscricao: somenteDigitos(inscricao),
  })

  if (response.status !== 201) {
    return {
      success: false,
      error:
        mapApiToMensagemErro(response.data, response.status) ??
        'Não foi possível adicionar o imóvel. Tente novamente mais tarde.',
      status: response.status,
    }
  }

  revalidatePath('/divida-ativa/imoveis')
  revalidatePath('/divida-ativa')

  return { success: true, data: mapApiToImovel(response.data) }
}
