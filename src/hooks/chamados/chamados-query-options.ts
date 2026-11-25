import {
  chamadosRetry,
  fetchChamadoDetalhe,
  fetchChamadoPublico,
  fetchChamadosSalesforce,
  fetchChamadosSgrc,
} from '@/lib/chamados/fetchers'
import {
  CHAMADOS_DETALHE_STALE_MS,
  CHAMADOS_PUBLICO_STALE_MS,
  CHAMADOS_SALESFORCE_STALE_MS,
  CHAMADOS_SGRC_STALE_MS,
  chamadosKeys,
} from '@/lib/chamados/query-keys'
import { queryOptions } from '@tanstack/react-query'

/**
 * `queryOptions` compartilhados entre hooks, `prefetchQuery` e `fetchQuery`:
 * key, fetcher e staleTime moram num lugar só.
 */

/** Lista do novo 1746 (Mulesoft/Salesforce). Também alimenta o banner da home. */
export const chamadosSalesforceQueryOptions = () =>
  queryOptions({
    queryKey: chamadosKeys.salesforce(),
    queryFn: ({ signal }) => fetchChamadosSalesforce(signal),
    staleTime: CHAMADOS_SALESFORCE_STALE_MS,
    retry: chamadosRetry,
  })

/** Histórico do 1746 legado (RMI), uma página por vez. */
export const chamadosSgrcQueryOptions = (page: number) =>
  queryOptions({
    queryKey: chamadosKeys.sgrc(page),
    queryFn: ({ signal }) => fetchChamadosSgrc(page, signal),
    staleTime: CHAMADOS_SGRC_STALE_MS,
    retry: chamadosRetry,
  })

export const chamadoDetalheQueryOptions = (protocolo: string) =>
  queryOptions({
    queryKey: chamadosKeys.detail(protocolo),
    queryFn: ({ signal }) => fetchChamadoDetalhe(protocolo, signal),
    staleTime: CHAMADOS_DETALHE_STALE_MS,
    retry: chamadosRetry,
  })

export const chamadoPublicoQueryOptions = (protocolo: string) =>
  queryOptions({
    queryKey: chamadosKeys.publico(protocolo),
    queryFn: ({ signal }) => fetchChamadoPublico(protocolo, signal),
    staleTime: CHAMADOS_PUBLICO_STALE_MS,
    retry: chamadosRetry,
  })
