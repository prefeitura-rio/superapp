import {
  getApiPublicEmpregabilidadeVagasId,
  getApiPublicEmpregabilidadeVagasSlugSlug,
} from '@/http-courses/empregabilidade-vagas-public/empregabilidade-vagas-public'
import type { EmpregabilidadeVaga } from '@/http-courses/models'
import { getVagaPath, isVagaUuid, isValidVagaSlug } from '@/lib/vaga-slug'

export type VagaParamResolution =
  | { kind: 'found'; vaga: EmpregabilidadeVaga }
  | { kind: 'redirect'; path: string }
  | { kind: 'not_found' }

/**
 * Resolve o segmento da URL de detalhe da vaga (`/servicos/trabalho/<param>`).
 *
 * - UUID (URL antiga): busca pelo id e, se a vaga tem slug, pede redirect
 *   permanente para a URL canônica com o slug.
 * - Slug: busca pelo slug. Slug histórico é seguido pela API (301) até o
 *   atual; se o slug devolvido difere do pedido, pede redirect para ele.
 * - Qualquer outro valor: não encontrada (sem chamada à API).
 */
export async function resolveVagaParam(
  param: string
): Promise<VagaParamResolution> {
  if (isVagaUuid(param)) {
    const response = await getApiPublicEmpregabilidadeVagasId(param)
    if (response.status !== 200 || !response.data) {
      return { kind: 'not_found' }
    }

    const vaga = response.data
    const canonicalPath = getVagaPath({ id: param, slug: vaga.slug })
    if (canonicalPath !== getVagaPath({ id: param })) {
      return { kind: 'redirect', path: canonicalPath }
    }
    return { kind: 'found', vaga }
  }

  if (!isValidVagaSlug(param)) {
    return { kind: 'not_found' }
  }

  const response = await getApiPublicEmpregabilidadeVagasSlugSlug(param)
  if (response.status !== 200 || !response.data) {
    return { kind: 'not_found' }
  }

  const vaga = response.data
  const canonicalSlug = vaga.slug?.trim()
  if (
    canonicalSlug &&
    canonicalSlug !== param &&
    isValidVagaSlug(canonicalSlug)
  ) {
    return { kind: 'redirect', path: getVagaPath({ slug: canonicalSlug }) }
  }
  return { kind: 'found', vaga }
}
