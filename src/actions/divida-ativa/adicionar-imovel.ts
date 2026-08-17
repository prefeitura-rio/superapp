'use server'

import { postImovel } from '@/http-divida-ativa/imoveis/imoveis'
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
 * Cadastra o imóvel no portal — é o "Confirmar" da tela de confirmação, e **só ele grava**.
 * A consulta que preenche aquela tela é uma leitura à parte (`getDalDividaAtivaConsultaInscricao`);
 * no portal legado os dois passos eram um só.
 *
 * O vínculo com o cidadão é feito pela API a partir do Bearer token: nada de CPF no corpo.
 */
export async function adicionarImovel(
  inscricao: string
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

  const response = await postImovel({
    inscricaoImobiliaria: somenteDigitos(inscricao),
  })

  if (response.status !== 201) {
    return {
      success: false,
      error:
        mapApiToMensagemErro(response.data) ??
        'Não foi possível adicionar o imóvel. Tente novamente mais tarde.',
      status: response.status,
    }
  }

  revalidatePath('/divida-ativa/imoveis')
  revalidatePath('/divida-ativa')

  return { success: true, data: mapApiToImovel(response.data) }
}
