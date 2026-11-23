import { getChamadoDetail } from '@/http-pref-rio-cidadao/default/default'
import { getMaintenanceRequestProtocolo } from '@/http/maintenance-request/maintenance-request'
import type { ModelsPublicMaintenanceRequestResponse } from '@/http/models'
import { mapearDetalheSgrc, normalizarProtocoloSgrc } from '@/lib/chamados/sgrc'
import {
  isSalesforceServicesEnabled,
  isSgrcHistoricoEnabled,
} from '@/lib/feature-flags'
import { parseJsonBody } from '@/lib/parse-json-body'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const ERRO_NAO_ENCONTRADO = 'Chamado não encontrado'
const ERRO_CONSULTA = 'Não foi possível consultar o chamado'

/**
 * O corpo de erro do Mule/Salesforce e do RMI (hostname do backend, path do
 * Apex REST, códigos internos) nunca é repassado ao navegador: só o status e
 * uma mensagem genérica.
 */
function respostaDeErro(status: number) {
  const error = status === 404 ? ERRO_NAO_ENCONTRADO : ERRO_CONSULTA
  return NextResponse.json({ error }, { status })
}

function semCache(resposta: NextResponse) {
  resposta.headers.set('Cache-Control', 'private, no-store')
  return resposta
}

/**
 * Chamado do 1746 legado (SGRC) visto pelo titular. O RMI reconhece o titular
 * pelo Bearer da sessão; sem nenhum chamado dele no protocolo, responde 404 e
 * a página cai na consulta pública.
 */
async function detalheSgrcDoTitular(protocolo: string) {
  const jar = await cookies()
  if (!jar.get('access_token')?.value) {
    return semCache(
      NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    )
  }

  let result: Awaited<ReturnType<typeof getMaintenanceRequestProtocolo>>
  try {
    result = await getMaintenanceRequestProtocolo(protocolo, {
      cache: 'no-store',
    })
  } catch (error) {
    console.error(
      'Falha ao consultar chamado SGRC no RMI:',
      error instanceof Error ? error.message : 'erro desconhecido'
    )
    return semCache(respostaDeErro(502))
  }

  if (result.status !== 200) {
    // 400 só viria de um protocolo fora do formato, que já filtramos.
    const status =
      result.status === 400 ? 404 : result.status >= 400 ? result.status : 502
    return semCache(respostaDeErro(status))
  }

  const corpo = parseJsonBody<ModelsPublicMaintenanceRequestResponse>(
    result.data
  )
  if (!corpo || typeof corpo !== 'object') {
    return semCache(respostaDeErro(502))
  }

  const detalhe = mapearDetalheSgrc(protocolo, corpo, 'dono')
  if (!detalhe) return semCache(respostaDeErro(404))

  return semCache(NextResponse.json(detalhe))
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ protocolo: string }> }
) {
  if (!isSalesforceServicesEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { protocolo } = await params

  const protocoloSgrc = normalizarProtocoloSgrc(protocolo)
  if (protocoloSgrc) {
    // Sem a flag, protocolo SGRC não existe: não vai ao RMI nem ao Mule, que
    // não conhece esse formato.
    if (!isSgrcHistoricoEnabled()) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return detalheSgrcDoTitular(protocoloSgrc)
  }

  let result: Awaited<ReturnType<typeof getChamadoDetail>>
  try {
    result = await getChamadoDetail(protocolo)
  } catch (error) {
    console.error('Falha ao consultar detalhe do chamado:', error)
    return respostaDeErro(502)
  }

  if (result.status >= 400) {
    return respostaDeErro(result.status)
  }

  return NextResponse.json(parseJsonBody(result.data), {
    status: result.status,
  })
}
