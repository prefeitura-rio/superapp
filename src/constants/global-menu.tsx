import { PhoneIcon, ServicesIcon, UserIcon, WalletIcon } from '@/assets/icons'
import { MessageCircleIcon } from '@/assets/icons/message-circle'
import { CARTA_DE_SERVICOS_ROUTE } from '@/constants/carta-de-servicos'
import { TERMOS_DE_USO_ROUTE } from '@/constants/termos-de-uso/platforms'
import { TICKET_FORM_BASE_URL } from '@/constants/url'
import {
  isFeatureEnabled,
  isSalesforceServicesEnabled,
} from '@/lib/feature-flags'
// Sem equivalente em src/assets/icons (falta no design system).
import { FileTextIcon, GraduationCapIcon, LayersIcon } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * Menu global (PREF-418), fiel ao handoff "Handoff - fluxo de menu" do Figma
 * SuperApp (oficial). Um item só aparece quando tem destino para o estado de
 * login atual, então nenhum ponto de entrada aponta para 404.
 *
 * Atendimentos e Carta de serviços seguem a flag do Salesforce, a mesma que o
 * middleware usa para liberar essas rotas e o footer para os seus links.
 */
export interface GlobalMenuLink {
  id: string
  label: string
  /** Destino com login. Item é omitido quando não há destino. */
  href?: string
  /** Exige login: some do menu deslogado (salvo `hrefWhenLoggedOut`). */
  requiresAuth?: boolean
  /**
   * Destino para visitante. Quando presente, o item continua no menu
   * deslogado apontando para cá, em vez de ser removido.
   */
  hrefWhenLoggedOut?: string
  /** Só no menu deslogado (ex.: Consulta de protocolo). */
  onlyLoggedOut?: boolean
  /**
   * Recuo dentro da seção: 1 = item da seção (Ver cursos); 2 = filho de um
   * item (Meus cursos, abaixo de Ver cursos).
   */
  level?: 1 | 2
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

const cursos = isFeatureEnabled('cursos')
const empregos = isFeatureEnabled('empregos')
const salesforce = isSalesforceServicesEnabled()

const ENTRIES: GlobalMenuEntry[] = [
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
        href: cursos ? '/servicos/cursos' : undefined,
      },
      {
        id: 'meus-cursos',
        label: 'Meus cursos',
        href: cursos ? '/servicos/cursos/meus-cursos' : undefined,
        requiresAuth: true,
        level: 2,
      },
      {
        id: 'certificados',
        label: 'Meus certificados',
        href: cursos ? '/servicos/cursos/certificados' : undefined,
        requiresAuth: true,
        level: 2,
      },
      {
        id: 'ver-vagas',
        label: 'Ver vagas',
        href: empregos ? '/servicos/trabalho' : undefined,
      },
      {
        id: 'minhas-candidaturas',
        label: 'Minhas candidaturas',
        href: empregos ? '/servicos/trabalho/minhas-candidaturas' : undefined,
        requiresAuth: true,
        level: 2,
      },
      {
        id: 'meu-curriculo',
        label: 'Meu currículo',
        href: empregos ? '/servicos/trabalho/curriculo' : undefined,
        requiresAuth: true,
        level: 2,
      },
    ],
  },
  {
    kind: 'section',
    id: 'atendimentos',
    label: 'Atendimentos',
    icon: <PhoneIcon className={iconClassName} />,
    items: [
      // Logado: tudo vive em Minhas solicitações (Ouvidoria e LAI abrem a aba
      // correspondente). Deslogado: consulta por protocolo e os formulários.
      {
        id: 'minhas-solicitacoes',
        label: 'Minhas solicitações',
        href: salesforce ? '/minhas-solicitacoes' : undefined,
        requiresAuth: true,
      },
      {
        id: 'consulta-protocolo',
        label: 'Consulta de protocolo',
        href: salesforce ? '/consulta-protocolo' : undefined,
        onlyLoggedOut: true,
      },
      {
        id: 'ouvidoria',
        label: 'Ouvidoria',
        href: salesforce ? '/minhas-solicitacoes?filtro=ouvidoria' : undefined,
        requiresAuth: true,
        hrefWhenLoggedOut: salesforce
          ? `${TICKET_FORM_BASE_URL}/ouvidoria`
          : undefined,
      },
      {
        id: 'lai',
        label: 'Lei de Acesso à Informação',
        href: salesforce
          ? '/minhas-solicitacoes?filtro=acesso-a-informacao'
          : undefined,
        requiresAuth: true,
        hrefWhenLoggedOut: salesforce
          ? `${TICKET_FORM_BASE_URL}/lai`
          : undefined,
      },
    ],
  },
  {
    kind: 'link',
    id: 'termos-de-uso',
    // Termos de uso e Política de Privacidade são um documento só (PREF-653).
    label: 'Termos de uso e política de privacidade',
    href: TERMOS_DE_USO_ROUTE,
    icon: <FileTextIcon className={iconClassName} />,
  },
  {
    kind: 'link',
    id: 'carta-de-servicos',
    label: 'Carta de serviços',
    href: salesforce ? CARTA_DE_SERVICOS_ROUTE : undefined,
    icon: <LayersIcon className={iconClassName} />,
  },
  {
    kind: 'link',
    id: 'faq',
    label: 'Perguntas frequentes',
    href: '/faq',
    icon: <MessageCircleIcon className={iconClassName} />,
  },
  {
    kind: 'link',
    id: 'meu-perfil',
    label: 'Meu perfil',
    href: '/meu-perfil',
    requiresAuth: true,
    icon: <UserIcon className={iconClassName} />,
  },
]

/**
 * Destino efetivo do item para o estado de autenticação atual. Retorna
 * `undefined` quando o item não deve aparecer — seja porque não há destino,
 * seja porque não se aplica a quem está (ou não está) logado.
 */
function resolveHref(item: GlobalMenuLink, isLoggedIn: boolean) {
  if (isLoggedIn) return item.onlyLoggedOut ? undefined : item.href
  if (item.hrefWhenLoggedOut) return item.hrefWhenLoggedOut
  return item.requiresAuth ? undefined : item.href
}

/**
 * Menu deslogado só contém o que o visitante consegue acessar: os itens
 * restritos são removidos (não desabilitados), conforme o handoff. Documentos,
 * Ouvidoria e LAI continuam, com o destino próprio para visitante.
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
