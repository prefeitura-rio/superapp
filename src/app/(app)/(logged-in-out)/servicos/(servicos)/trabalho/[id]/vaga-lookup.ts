import {
  getApiPublicEmpregabilidadeVagasId,
  getApiPublicEmpregabilidadeVagasSlugSlug,
} from '@/http-courses/empregabilidade-vagas-public/empregabilidade-vagas-public'
import type { EmpregabilidadeVaga } from '@/http-courses/models'

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export type PublicVagaResult =
  | { vaga: EmpregabilidadeVaga }
  | { redirectSlug: string }
  | null

export async function getPublicVaga(
  identifier: string
): Promise<PublicVagaResult> {
  if (UUID_PATTERN.test(identifier)) {
    const response = await getApiPublicEmpregabilidadeVagasId(identifier)
    if (response.status !== 200 || !response.data) {
      return null
    }

    // Canonicaliza para a URL SEO: acesso por id sempre redireciona para o
    // slug quando disponível, preservando compatibilidade com links antigos.
    if (response.data.slug) {
      return { redirectSlug: response.data.slug }
    }

    return { vaga: response.data }
  }

  const response = await getApiPublicEmpregabilidadeVagasSlugSlug(identifier)

  if (response.status !== 200 || !response.data) {
    return null
  }

  // Slug histórico (título mudou): o app-go-api responde 301 com header
  // Location para o slug canônico, e o fetch do runtime segue o redirect
  // automaticamente, retornando a vaga canônica com status 200. Quando o slug
  // pedido difere do canônico, emitimos o 301 ao browser para preservar a URL
  // SEO em vez de renderizar sob a URL antiga.
  const canonicalSlug = response.data.slug
  if (canonicalSlug && canonicalSlug !== identifier) {
    return { redirectSlug: canonicalSlug }
  }

  return { vaga: response.data }
}
