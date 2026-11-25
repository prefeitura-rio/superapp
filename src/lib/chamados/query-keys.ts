/**
 * Query keys de chamados, do mais geral ao mais específico, para invalidar por
 * prefixo (`chamadosKeys.lists()` pega todas as listas).
 *
 * Nenhuma key leva CPF: o client nunca o vê (o BFF o lê do token) e o cache é
 * esvaziado no logout. O código da OS (`?os=`) também fica de fora: é só
 * seleção de UI sobre o mesmo protocolo.
 */
const all = ['chamados'] as const
const lists = [...all, 'list'] as const
const details = [...all, 'detail'] as const

export const chamadosKeys = {
  all,
  lists: () => lists,
  /** Lista do novo 1746 (Mulesoft/Salesforce). */
  salesforce: () => [...lists, 'salesforce'] as const,
  /** Histórico do 1746 legado (RMI), uma entrada por página. */
  sgrc: (page: number) => [...lists, 'sgrc', { page }] as const,
  details: () => details,
  /** Detalhe visto pelo titular (SGRC ou Salesforce, pelo formato do protocolo). */
  detail: (protocolo: string) => [...details, protocolo] as const,
  /** Consulta pública por protocolo (anônima, dados reduzidos). */
  publico: (protocolo: string) => [...all, 'publico', protocolo] as const,
}

export const CHAMADOS_SALESFORCE_STALE_MS = 2 * 60 * 1000
/** Alinhado ao `revalidate: 600` do Data Cache da DAL (`dal.ts`). */
export const CHAMADOS_SGRC_STALE_MS = 10 * 60 * 1000
export const CHAMADOS_DETALHE_STALE_MS = 2 * 60 * 1000
export const CHAMADOS_PUBLICO_STALE_MS = 60 * 1000
