import { listChamados } from '@/http-pref-rio-cidadao/default/default'
import type { ChamadosListResponse } from '@/http-pref-rio-cidadao/models'
import { parseJsonBody } from '@/lib/parse-json-body'
import { ChamadosHttpError } from './fetchers'

/**
 * Prefetch da lista do Salesforce em Server Components. Chama o Orval direto
 * (sem passar pelo BFF) e devolve o mesmo formato que `fetchChamadosSalesforce`
 * no navegador, para as duas rodarem sob a mesma query key.
 *
 * Só importar no servidor: o mutator lê a sessão de `next/headers`.
 */
export async function fetchChamadosSalesforceNoServidor(): Promise<ChamadosListResponse> {
  const result = await listChamados()
  // Status de erro não vira cache: o prefetch falha e o client tenta sozinho.
  if (result.status !== 200) throw new ChamadosHttpError(result.status)
  return parseJsonBody<ChamadosListResponse>(result.data) ?? {}
}
