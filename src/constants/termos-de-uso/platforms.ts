export const TERMOS_DE_USO_ROUTE = '/termos-de-uso'

export interface TermosDeUsoPlatform {
  /** Segmento da URL do detalhe: `/termos-de-uso/{slug}`. */
  slug: string
  /** Nome exibido na lista e no título do detalhe ("Termos de uso: {name}"). */
  name: string
}

/**
 * Plataformas com termos de uso, na ordem em que aparecem na lista.
 * O texto de cada uma fica separado do componente para poder ser trocado
 * por plataforma sem mexer na tela.
 */
export const TERMOS_DE_USO_PLATFORMS: readonly TermosDeUsoPlatform[] = [
  { slug: 'prefrio-site', name: 'PrefRio Site' },
  { slug: 'prefrio-central-telefonica', name: 'PrefRio Central Telefonica' },
  { slug: 'prefrio-whatsapp', name: 'PrefRio Whatsapp' },
  { slug: 'cursos', name: 'Cursos' },
  { slug: 'empregos', name: 'Empregos' },
]

export function findTermosDeUsoPlatform(slug: string) {
  return TERMOS_DE_USO_PLATFORMS.find(platform => platform.slug === slug)
}

export function buildTermosDeUsoHref(slug: string) {
  return `${TERMOS_DE_USO_ROUTE}/${slug}`
}

/** Minúsculas e sem acento, para "telefônica" achar "Telefonica". */
function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

/** Filtra pelo nome da plataforma; busca vazia devolve a lista inteira. */
export function filterTermosDeUsoPlatforms(
  platforms: readonly TermosDeUsoPlatform[],
  query: string
) {
  const needle = normalize(query)
  if (!needle) return [...platforms]
  return platforms.filter(platform => normalize(platform.name).includes(needle))
}
