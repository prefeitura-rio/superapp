import { PhoneIcon, ServicesIcon, WalletIcon } from '@/assets/icons'
import { Home2Icon } from '@/assets/icons/home2-icon'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { GraduationCapIcon, StarIcon } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * Destinos ainda não definidos pelo produto. O item só é renderizado quando
 * `href` existe, então nenhum ponto de entrada aponta para 404.
 *
 * - LAI: redirecionamento do Salesforce, PM confirmando com o Patrick.
 * - Política de Privacidade: fora da lista do card, aguardando decisão.
 * - Carta de Serviços: marcada como "não desenvolver - v1" no handoff;
 *   proposta é apontar para /servicos (o catálogo já é servido pela API da
 *   Carta de Serviços), aguardando confirmação.
 */
const PENDING_DESTINATION = undefined

export interface GlobalMenuLink {
  id: string
  label: string
  /** Item é omitido do menu quando o destino ainda não está definido. */
  href?: string
  requiresAuth?: boolean
  /**
   * Destino alternativo para visitante. Quando presente, o item continua no
   * menu deslogado apontando para cá, em vez de ser removido.
   */
  hrefWhenLoggedOut?: string
}

interface GlobalMenuLeaf extends GlobalMenuLink {
  kind: 'link'
  icon: ReactNode
}

interface GlobalMenuSection {
  kind: 'section'
  id: string
  label: string
  icon: ReactNode
  items: GlobalMenuLink[]
}

export type GlobalMenuEntry = GlobalMenuLeaf | GlobalMenuSection

const iconClassName = 'h-6 w-6 shrink-0 text-foreground'

const ENTRIES: GlobalMenuEntry[] = [
  {
    kind: 'link',
    id: 'home',
    label: 'Página inicial',
    href: '/',
    icon: <Home2Icon className={iconClassName} />,
  },
  {
    kind: 'link',
    id: 'servicos',
    label: 'Serviços',
    href: '/servicos',
    icon: <ServicesIcon className={iconClassName} />,
  },
  {
    kind: 'link',
    id: 'documentos',
    label: 'Documentos',
    href: '/carteira',
    requiresAuth: true,
    hrefWhenLoggedOut: '/autenticacao-necessaria/carteira',
    icon: <WalletIcon className={iconClassName} />,
  },
  {
    kind: 'section',
    id: 'oportunidades-cariocas',
    label: 'Oportunidades Cariocas',
    icon: <GraduationCapIcon className={iconClassName} />,
    items: [
      {
        id: 'ver-cursos',
        label: 'Ver cursos',
        href: isFeatureEnabled('cursos') ? '/servicos/cursos' : undefined,
      },
      {
        id: 'meus-cursos',
        label: 'Meus cursos',
        href: isFeatureEnabled('cursos')
          ? '/servicos/cursos/meus-cursos'
          : undefined,
        requiresAuth: true,
      },
      {
        id: 'certificados',
        label: 'Certificados',
        href: isFeatureEnabled('cursos')
          ? '/servicos/cursos/certificados'
          : undefined,
        requiresAuth: true,
      },
      {
        id: 'ver-vagas',
        label: 'Ver vagas',
        href: isFeatureEnabled('empregos') ? '/servicos/trabalho' : undefined,
      },
      {
        id: 'minhas-candidaturas',
        label: 'Minhas candidaturas',
        href: isFeatureEnabled('empregos')
          ? '/servicos/trabalho/minhas-candidaturas'
          : undefined,
        requiresAuth: true,
      },
      {
        id: 'meu-curriculo',
        label: 'Meu currículo',
        href: isFeatureEnabled('empregos')
          ? '/servicos/trabalho/curriculo'
          : undefined,
        requiresAuth: true,
      },
    ],
  },
  {
    kind: 'section',
    id: 'atendimentos',
    label: 'Atendimentos',
    icon: <PhoneIcon className={iconClassName} />,
    items: [
      {
        id: 'minhas-solicitacoes',
        label: 'Minhas solicitações',
        href:
          process.env.NEXT_PUBLIC_FEATURE_CHAMADOS === 'true'
            ? '/minhas-solicitacoes'
            : undefined,
        requiresAuth: true,
      },
      {
        id: 'consulta-protocolo',
        label: 'Consulta de protocolo',
        href: '/consulta-protocolo',
      },
      { id: 'ouvidoria', label: 'Ouvidoria', href: '/ouvidoria' },
      {
        id: 'lai',
        label: 'Lei de Acesso a Informação',
        href: PENDING_DESTINATION,
      },
    ],
  },
  {
    kind: 'section',
    id: 'outros',
    label: 'Outros',
    icon: <StarIcon className={iconClassName} />,
    items: [
      {
        id: 'termos-de-uso',
        label: 'Termos de uso',
        href: '/termos-de-uso',
      },
      {
        id: 'politica-de-privacidade',
        label: 'Política de Privacidade',
        href: PENDING_DESTINATION,
      },
      {
        id: 'carta-de-servicos',
        label: 'Carta de Serviços',
        href: PENDING_DESTINATION,
      },
      { id: 'faq', label: 'Perguntas frequentes', href: '/faq' },
      {
        id: 'autorizacoes',
        label: 'Autorizações',
        href: '/meu-perfil/autorizacoes',
        requiresAuth: true,
      },
    ],
  },
]

/**
 * Destino efetivo do item para o estado de autenticação atual. Retorna
 * `undefined` quando o item não deve aparecer — seja porque o produto ainda não
 * definiu o destino, seja porque exige login e não há alternativa para visitante.
 */
function resolveHref(item: GlobalMenuLink, isLoggedIn: boolean) {
  if (isLoggedIn) return item.href
  if (item.hrefWhenLoggedOut) return item.hrefWhenLoggedOut
  return item.requiresAuth ? undefined : item.href
}

/**
 * Menu deslogado só contém o que o usuário consegue acessar sem login: os itens
 * restritos são removidos (não desabilitados), conforme o handoff. A exceção é
 * Documentos, que continua visível e leva à tela de autenticação necessária.
 */
export function buildGlobalMenu(isLoggedIn: boolean): GlobalMenuEntry[] {
  return ENTRIES.reduce<GlobalMenuEntry[]>((entries, entry) => {
    if (entry.kind === 'link') {
      const href = resolveHref(entry, isLoggedIn)
      if (href) entries.push({ ...entry, href })
      return entries
    }

    const items = entry.items.flatMap(item => {
      const href = resolveHref(item, isLoggedIn)
      return href ? [{ ...item, href }] : []
    })
    if (items.length > 0) entries.push({ ...entry, items })
    return entries
  }, [])
}
