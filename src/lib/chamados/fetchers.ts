import type { ChamadosListResponse } from '@/http-pref-rio-cidadao/models'
import type { ListaSgrc } from './sgrc'

/** Resposta não-2xx do BFF `/api/chamados*`. Só carrega o status. */
export class ChamadosHttpError extends Error {
  constructor(readonly status: number) {
    super(`Falha ao consultar chamados: ${status}`)
    this.name = 'ChamadosHttpError'
  }
}

/**
 * Não repete 4xx (sessão, protocolo inexistente: repetir não muda nada); repete
 * uma vez falha de rede ou 5xx.
 */
export function chamadosRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ChamadosHttpError && error.status < 500) return false
  return failureCount < 1
}

/**
 * Payload do BFF de detalhe. Tipado de forma frouxa de propósito: o BFF
 * devolve o Salesforce cru ou o `DetalheSgrc` mapeado, e a tela lê campos dos
 * dois.
 */
export type ChamadoJson = Record<string, any>

export type ChamadoDetalhe =
  | { visao: 'titular'; data: ChamadoJson }
  | { visao: 'publico'; data: ChamadoJson }

/** Fetchers do navegador: falam só com o BFF, que lê a sessão dos cookies. */
export async function fetchChamadosSalesforce(
  signal?: AbortSignal
): Promise<ChamadosListResponse> {
  const res = await fetch('/api/chamados', { signal })
  if (!res.ok) throw new ChamadosHttpError(res.status)
  if (res.status === 204) return {}
  return (await res.json()) ?? {}
}

export async function fetchChamadosSgrc(
  page: number,
  signal?: AbortSignal
): Promise<ListaSgrc> {
  const res = await fetch(`/api/chamados?origem=sgrc&page=${page}`, { signal })
  if (!res.ok) throw new ChamadosHttpError(res.status)
  return res.json()
}

/** `null` quando o protocolo não existe (404/204): resultado esperado, não erro. */
export async function fetchChamadoPublico(
  protocolo: string,
  signal?: AbortSignal
): Promise<ChamadoJson | null> {
  const res = await fetch(
    `/api/chamados-publico/${encodeURIComponent(protocolo)}`,
    { signal }
  )
  if (res.status === 404 || res.status === 204) return null
  if (!res.ok) throw new ChamadosHttpError(res.status)
  return res.json()
}

/**
 * Tenta o detalhe do titular; sem sessão, sem permissão ou com falha de rede,
 * cai na consulta pública.
 */
export async function fetchChamadoDetalhe(
  protocolo: string,
  signal?: AbortSignal
): Promise<ChamadoDetalhe> {
  try {
    const res = await fetch(`/api/chamados/${encodeURIComponent(protocolo)}`, {
      signal,
    })
    if (res.ok) {
      const json = await res.json()
      if (json?.protocolo) return { visao: 'titular', data: json }
    }
  } catch (error) {
    // Cancelamento não é falha de rede: não pode virar fallback.
    if (signal?.aborted) throw error
  }

  const publico = await fetchChamadoPublico(protocolo, signal)
  if (!publico) throw new ChamadosHttpError(404)
  return { visao: 'publico', data: publico }
}
