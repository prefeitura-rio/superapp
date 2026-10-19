import { isFeatureEnabled } from '@/lib/feature-flags'

export type OportunidadesType = 'cursos' | 'empregabilidade' | 'mei'

export interface OportunidadesSection {
  id: OportunidadesType
  feature: string
  label: string
  href: string
  searchUrl: string
  menuHref: string
  logoHref: string
  listingPaths: readonly string[]
  chromePaths: readonly string[]
}

const WITH_MEI_ORDER = ['empregabilidade', 'mei', 'cursos'] as const
const WITHOUT_MEI_ORDER = ['cursos', 'empregabilidade'] as const

export const OPORTUNIDADES_SECTIONS: readonly OportunidadesSection[] = [
  {
    id: 'empregabilidade',
    feature: 'empregos',
    label: 'Trabalho',
    href: '/servicos/trabalho/',
    searchUrl: '/busca?tipo=empregos',
    menuHref: '/servicos/trabalho/menu',
    logoHref: '/servicos/trabalho',
    listingPaths: ['/servicos/trabalho'],
    chromePaths: ['/servicos/trabalho', '/servicos/trabalho/menu'],
  },
  {
    id: 'mei',
    feature: 'mei',
    label: 'MEI',
    href: '/servicos/mei',
    searchUrl: '/busca?tipo=mei',
    menuHref: '/servicos/mei/menu',
    logoHref: '/servicos/mei',
    listingPaths: ['/servicos/mei'],
    chromePaths: ['/servicos/mei', '/servicos/mei/menu'],
  },
  {
    id: 'cursos',
    feature: 'cursos',
    label: 'Cursos',
    href: '/servicos/cursos',
    searchUrl: '/servicos/cursos/busca',
    menuHref: '/servicos/cursos/opcoes',
    logoHref: '/servicos/cursos',
    listingPaths: ['/servicos/cursos'],
    chromePaths: ['/servicos/cursos', '/servicos/cursos/opcoes'],
  },
]

function normalizePath(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
}

export function resolveOportunidadesSection(
  pathname: string | null
): OportunidadesSection | undefined {
  if (!pathname) return undefined
  const normalized = normalizePath(pathname)
  return OPORTUNIDADES_SECTIONS.find(section =>
    section.chromePaths.includes(normalized)
  )
}

export function isOportunidadesListing(pathname: string | null): boolean {
  if (!pathname) return false
  const normalized = normalizePath(pathname)
  return OPORTUNIDADES_SECTIONS.some(section =>
    section.listingPaths.includes(normalized)
  )
}

export function getVisibleOportunidadesTabs(): OportunidadesSection[] {
  const enabled = OPORTUNIDADES_SECTIONS.filter(section =>
    isFeatureEnabled(section.feature)
  )
  const meiEnabled = enabled.some(section => section.id === 'mei')
  const order = meiEnabled ? WITH_MEI_ORDER : WITHOUT_MEI_ORDER
  return order.flatMap(id => enabled.filter(section => section.id === id))
}
