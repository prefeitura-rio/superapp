import {
  formatDate,
  mapCategoria,
  normalizeStatus,
} from '@/app/(app)/(logged-in)/minhas-solicitacoes/helpers'
import type { RequestItem } from '@/app/(app)/(logged-in)/minhas-solicitacoes/types'
import type { ChamadosListResponse } from '@/http-pref-rio-cidadao/models'
import type { ListaSgrc } from './sgrc'

/** Forma comum às duas origens (Salesforce e SGRC) para a lista. */
interface ProtocoloParaLista {
  protocolo?: string
  status?: string
  dataAbertura?: string
  ordens_de_servico?: {
    codigoOs?: string
    servico?: string
    subtema?: string
    categoria?: string
    status?: string
    dataAbertura?: string
    isAcessoInformacao?: boolean
  }[]
}

export function itensDeProtocolos(
  protocolos: ProtocoloParaLista[] | undefined
): RequestItem[] {
  return (protocolos ?? []).flatMap(protocolo =>
    (protocolo.ordens_de_servico ?? []).map(os => ({
      protocolo: protocolo.protocolo ?? '',
      codigoOs: os.codigoOs ?? '',
      servico: os.servico ?? os.subtema ?? '—',
      categoria: mapCategoria(os.categoria),
      status: normalizeStatus(os.status ?? protocolo.status),
      dataAbertura: formatDate(os.dataAbertura ?? protocolo.dataAbertura),
      isAcessoInformacao: os.isAcessoInformacao ?? false,
    }))
  )
}

/** `select` da lista do Salesforce. Referência estável (nível de módulo). */
export function selecionarItensSalesforce(
  data: ChamadosListResponse
): RequestItem[] {
  return itensDeProtocolos(data.protocolos)
}

export interface PaginaSgrc {
  itens: RequestItem[]
  totalPages: number
}

/** `select` do histórico SGRC. Referência estável (nível de módulo). */
export function selecionarPaginaSgrc(data: ListaSgrc): PaginaSgrc {
  return {
    itens: itensDeProtocolos(data?.protocolos),
    totalPages: data?.pagination?.totalPages ?? 1,
  }
}

const QUINZE_DIAS_MS = 15 * 24 * 60 * 60 * 1000

function recente(data: string | undefined): boolean {
  if (!data) return false
  return Date.now() - new Date(data).getTime() <= QUINZE_DIAS_MS
}

/**
 * Ordens que o banner da home mostra como "para acompanhar": abertas, ou com
 * atualização nos últimos 15 dias. Só Salesforce (o SGRC é histórico).
 */
export function contarParaAcompanhar(data: ChamadosListResponse): number {
  let total = 0
  for (const protocolo of data.protocolos ?? []) {
    const atualizadoRecentemente = recente(protocolo.dataUltimaAtualizacao)
    for (const os of protocolo.ordens_de_servico ?? []) {
      if (os.status === 'Aberto' || atualizadoRecentemente) total++
    }
  }
  return total
}
