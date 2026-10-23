'use server'

import { getDividaAtivaCepCep } from '@/http-divida-ativa/divida-ativa-requerimentos/divida-ativa-requerimentos'
import { somenteDigitos } from '@/lib/divida-ativa-utils'
import { getUserInfoFromToken } from '@/lib/user-info'
import type { ResultadoAcaoDividaAtiva } from './resultado'

export interface EnderecoDoCep {
  logradouro: string
  bairro: string
  cidade: string
  uf: string
}

const CEP_NAO_ENCONTRADO =
  'Não encontramos este CEP. Confira o número ou preencha o endereço.'

/**
 * Endereço de um CEP, para preencher o endereço de correspondência do requerimento.
 *
 * Vai pela `api-imoveis` (`GET /divida-ativa/cep/{cep}`, ViaCEP por trás), não direto ao
 * ViaCEP: a mesma origem que o portal legado consultava, e sem chamada de terceiro no browser.
 *
 * Campo vazio na resposta é normal — CEP geral de cidade pequena não tem logradouro nem
 * bairro. A tela deixa editável o que vier vazio.
 */
export async function consultarCep(
  cep: string
): Promise<ResultadoAcaoDividaAtiva<EnderecoDoCep>> {
  const { cpf } = await getUserInfoFromToken()

  if (!cpf) {
    return { success: false, error: 'Usuário não autenticado', status: 401 }
  }

  const digitos = somenteDigitos(cep)
  if (digitos.length !== 8) {
    return {
      success: false,
      error: 'Informe o CEP com 8 números.',
      status: 400,
    }
  }

  try {
    const response = await getDividaAtivaCepCep(digitos, { cache: 'no-store' })
    const dados = response.status === 200 ? response.data : null

    if (!dados || dados.mensagemErro || (!dados.cidade && !dados.uf)) {
      return { success: false, error: CEP_NAO_ENCONTRADO, status: 404 }
    }

    return {
      success: true,
      data: {
        logradouro: dados.logradouro ?? '',
        bairro: dados.bairro ?? '',
        cidade: dados.cidade ?? '',
        uf: dados.uf ?? '',
      },
    }
  } catch {
    return { success: false, error: CEP_NAO_ENCONTRADO, status: 502 }
  }
}
