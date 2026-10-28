/**
 * URLs públicas de vagas de empregabilidade.
 *
 * A API devolve em cada vaga um `slug` no formato
 * `<titulo-slugificado>-<12 primeiros hex do UUID>` (mesmo esquema de Serviços),
 * e resolve slugs históricos com 301 para o slug atual. A URL canônica da vaga
 * é `/servicos/trabalho/<slug>`; a URL antiga, só com o UUID, continua aceita e
 * é redirecionada para a canônica.
 *
 * Este módulo é puro (sem dependências de servidor) para ser usado também em
 * componentes client.
 */

export const VAGAS_BASE_PATH = '/servicos/trabalho'

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const SLUG_MAX_LENGTH = 300

/** Identifica o segmento antigo da URL de vaga (somente o UUID). */
export function isVagaUuid(value: string): boolean {
  return UUID_PATTERN.test(value)
}

/** Slug seguro para compor a URL: minúsculas, dígitos e hífens simples. */
export function isValidVagaSlug(value: string): boolean {
  return (
    value.length > 0 &&
    value.length <= SLUG_MAX_LENGTH &&
    SLUG_PATTERN.test(value)
  )
}

export interface VagaPathSource {
  id?: string | null
  slug?: string | null
}

/**
 * Segmento da URL da vaga: o slug quando a API o fornece, senão o id
 * (que continua resolvendo e redireciona para o slug).
 */
export function getVagaPathSegment(vaga: VagaPathSource): string {
  const slug = vaga.slug?.trim()
  if (slug && isValidVagaSlug(slug)) {
    return slug
  }
  return vaga.id?.trim() ?? ''
}

/** Caminho da página de detalhe da vaga (`/servicos/trabalho/<slug>`). */
export function getVagaPath(vaga: VagaPathSource): string {
  return `${VAGAS_BASE_PATH}/${getVagaPathSegment(vaga)}`
}
