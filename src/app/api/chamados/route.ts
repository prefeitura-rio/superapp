import { listChamados } from '@/http-pref-rio-cidadao/default/default'
import { POR_PAGINA_SGRC, mapearListaSgrc } from '@/lib/chamados/sgrc'
import { getDalCitizenCpfMaintenanceRequest } from '@/lib/dal'
import {
  isSalesforceServicesEnabled,
  isSgrcHistoricoEnabled,
} from '@/lib/feature-flags'
import { parseJsonBody } from '@/lib/parse-json-body'
import { getUserInfoFromToken } from '@/lib/user-info'
import { NextResponse } from 'next/server'

const ERRO_CONSULTA = 'Não foi possível consultar os chamados'

/**
 * O corpo de erro do Mule/Salesforce e do RMI (mensagens do gateway, hostname
 * do backend, códigos internos) nunca é repassado ao navegador: só o status e
 * uma mensagem genérica.
 */
function respostaDeErro(status: number) {
  return NextResponse.json({ error: ERRO_CONSULTA }, { status })
}

function semCache(resposta: NextResponse) {
  resposta.headers.set('Cache-Control', 'private, no-store')
  return resposta
}

function paginaDe(valor: string | null): number {
  if (!valor || !/^\d{1,6}$/.test(valor)) return 1
  return Math.max(1, Number(valor))
}

/**
 * Histórico do 1746 legado (SGRC) do cidadão logado, paginado pelo RMI. O CPF
 * vem do token da sessão, nunca do navegador.
 */
async function listarHistoricoSgrc(req: Request) {
  const { cpf: claim } = await getUserInfoFromToken()
  const cpf = claim.replace(/\D/g, '')
  if (cpf.length !== 11) {
    return semCache(
      NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    )
  }

  const page = paginaDe(new URL(req.url).searchParams.get('page'))

  let result: Awaited<ReturnType<typeof getDalCitizenCpfMaintenanceRequest>>
  try {
    result = await getDalCitizenCpfMaintenanceRequest(cpf, {
      page,
      per_page: POR_PAGINA_SGRC,
    })
  } catch (error) {
    console.error(
      'Falha ao consultar o histórico SGRC no RMI:',
      error instanceof Error ? error.message : 'erro desconhecido'
    )
    return semCache(respostaDeErro(502))
  }

  if (result.status !== 200) {
    return semCache(respostaDeErro(result.status >= 400 ? result.status : 502))
  }

  const corpo = parseJsonBody<typeof result.data>(result.data)
  if (!corpo || typeof corpo !== 'object') {
    return semCache(respostaDeErro(502))
  }

  return semCache(NextResponse.json(mapearListaSgrc(corpo, page)))
}

export async function GET(req: Request) {
  if (!isSalesforceServicesEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const origem = new URL(req.url).searchParams.get('origem')
  if (origem === 'sgrc') {
    // Sem a flag, o histórico SGRC não existe: nem sessão, nem RMI.
    if (!isSgrcHistoricoEnabled()) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return listarHistoricoSgrc(req)
  }

  let result: Awaited<ReturnType<typeof listChamados>>
  try {
    result = await listChamados()
  } catch (error) {
    console.error('Falha ao consultar a lista de chamados:', error)
    return respostaDeErro(502)
  }

  if (result.status >= 400) {
    return respostaDeErro(result.status)
  }

  return NextResponse.json(parseJsonBody(result.data), {
    status: result.status,
  })
}
