'use server'

import { postDividaAtivaValidarSenha } from '@/http-divida-ativa/divida-ativa-requerimentos/divida-ativa-requerimentos'
import { mapApiToMensagemErro } from '@/lib/divida-ativa-mappers'
import { getUserInfoFromToken } from '@/lib/user-info'
import type { ResultadoAcaoDividaAtiva } from './resultado'

const ERRO_GENERICO =
  'Não foi possível confirmar a senha agora. Tente novamente em alguns minutos.'

/**
 * Pré-validação da senha da conta Identidade Carioca, antes de enviar o requerimento.
 *
 * É conveniência de tela: a API valida a senha **de novo** no envio, então esta chamada não
 * autoriza nada. Serve para o cidadão corrigir uma senha errada sem esperar o envio inteiro
 * (anexos em base64 e a reconsulta das CDAs no DAM).
 *
 * ⚠️ A API responde **200 também para senha recusada**: o resultado está em `valida`. Por isso
 * "senha inválida" volta como `success: true` com `valida: false` — não é erro da chamada.
 *
 * A senha nunca vai para log: nem aqui, nem no corpo de erro.
 */
export async function validarSenha(
  senha: string
): Promise<
  ResultadoAcaoDividaAtiva<{ valida: boolean; mensagem: string | null }>
> {
  const { cpf } = await getUserInfoFromToken()

  if (!cpf) {
    return { success: false, error: 'Usuário não autenticado', status: 401 }
  }

  if (!senha) {
    return {
      success: true,
      data: { valida: false, mensagem: 'Por favor, informe a senha.' },
    }
  }

  try {
    const response = await postDividaAtivaValidarSenha(
      { senha },
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

    return {
      success: true,
      data: {
        valida: response.data.valida === true,
        mensagem: response.data.mensagem ?? null,
      },
    }
  } catch {
    return { success: false, error: ERRO_GENERICO, status: 502 }
  }
}
