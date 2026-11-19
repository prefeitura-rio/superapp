import { Breadcrumb } from '@/app/components/breadcrumb'
import HeaderWrapperClient from '@/app/components/header-wrapper-client'
import {
  AlertTriangleIcon,
  BadgeCheckIcon,
  BuildingIcon,
  BusIcon,
  CarIcon,
  CitizenshipIcon,
  CoinIcon,
  EyeOpenIcon,
  FileSearchIcon,
  FileTextIcon,
  FolderIcon,
  GlobeIcon,
  GraduationCapIcon,
  HeartPulseIcon,
  HelpCircleIcon,
  HomeBuildingIcon,
  IdCardIcon,
  LeafIcon,
  LockIcon,
  LuggageIcon,
  MessageBubbleIcon,
  MusicIcon,
  OpenBookIcon,
  PawIcon,
  SearchZoomIcon,
  ShieldCheckIcon,
  ShieldIcon,
  SuitcaseIcon,
  TrashBinIcon,
} from '@/assets/icons'
import { normalizeCategoryName } from '@/lib/categories'
import { fetchCategories } from '@/lib/categories'
import { isSalesforceServicesEnabled } from '@/lib/feature-flags'
import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Mapa do site',
  description: 'Todas as páginas do PrefRio, organizadas por assunto.',
}

interface SitemapItem {
  label: string
  href: string
  icon: ReactNode
  external?: boolean
}

/**
 * Mapeamento de slug normalizado de categoria → ícone SVG do design system.
 * Preservado do mapeamento original da página; GlobeIcon como fallback.
 */
const CATEGORY_ICON_MAP: Record<string, ReactNode> = {
  animais: <PawIcon />,
  'central anticorrupcao': <ShieldCheckIcon />,
  cidadania: <CitizenshipIcon />,
  cultura: <MusicIcon />,
  'cultura e lazer': <MusicIcon />,
  'defesa civil': <AlertTriangleIcon />,
  educacao: <GraduationCapIcon />,
  fiscalizacao: <EyeOpenIcon />,
  imoveis: <HomeBuildingIcon />,
  'lei geral de protecao de dados (lgpd)': <LockIcon />,
  lgpd: <LockIcon />,
  'licencas e alvaras': <BadgeCheckIcon />,
  licencas: <BadgeCheckIcon />,
  'meio ambiente': <LeafIcon />,
  ouvidoria: <MessageBubbleIcon />,
  processos: <FolderIcon />,
  saude: <HeartPulseIcon />,
  'servicos urbanos': <TrashBinIcon />,
  servidor: <IdCardIcon />,
  trabalho: <SuitcaseIcon />,
  transito: <CarIcon />,
  transparencia: <SearchZoomIcon />,
  transporte: <BusIcon />,
  tributos: <CoinIcon />,
  turismo: <LuggageIcon />,
}

function getCategoryIcon(categoryName: string): ReactNode {
  const slug = normalizeCategoryName(categoryName)
  return CATEGORY_ICON_MAP[slug] ?? <GlobeIcon />
}

const oportunidades: SitemapItem[] = [
  {
    label: 'Cursos',
    href: '/servicos/cursos',
    icon: <GraduationCapIcon />,
  },
  {
    label: 'Trabalho',
    href: '/servicos/trabalho',
    icon: <SuitcaseIcon />,
  },
]

function SitemapLink({ item }: { item: SitemapItem }) {
  const externalProps = item.external
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {}

  return (
    <Link
      href={item.href}
      {...externalProps}
      className="flex items-center gap-4 rounded-xl bg-background px-5 py-4 text-sm text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="shrink-0 text-muted-foreground">{item.icon}</span>
      <span className="flex-1 text-sm font-normal leading-5">{item.label}</span>
    </Link>
  )
}

function SitemapSection({
  id,
  title,
  items,
  columns,
}: {
  id: string
  title: string
  items: SitemapItem[]
  columns?: boolean
}) {
  return (
    <section
      aria-labelledby={id}
      className="flex flex-col gap-4 rounded-2xl bg-card p-5 h-fit"
    >
      <h2 id={id} className="text-base font-medium leading-6 text-foreground">
        {title}
      </h2>
      <ul
        className={
          columns
            ? 'grid grid-cols-1 min-[896px]:grid-cols-2 gap-2'
            : 'flex flex-col gap-2'
        }
      >
        {items.map(item => (
          <li key={item.label}>
            <SitemapLink item={item} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export default async function MapaDoSitePage() {
  const salesforce = isSalesforceServicesEnabled()

  const informacoes: SitemapItem[] = [
    {
      label: 'A Prefeitura',
      href: 'https://prefeitura.rio',
      icon: <BuildingIcon />,
      external: true,
    },
    ...(salesforce
      ? [
          {
            label: 'Carta de serviços',
            href: '/carta-de-servicos',
            icon: <FileTextIcon />,
          },
        ]
      : []),
    {
      label: 'Perguntas frequentes',
      href: '/faq',
      icon: <HelpCircleIcon />,
    },
    ...(salesforce
      ? [
          {
            label: 'Termos de uso e política de privacidade',
            href: '/termos-de-uso',
            icon: <ShieldIcon />,
          },
        ]
      : []),
  ]

  const atendimento: SitemapItem[] = [
    {
      label: 'Consulta de protocolo',
      href: '/consulta-protocolo',
      icon: <FileSearchIcon />,
    },
    {
      label: 'Ouvidoria',
      href: '/ouvidoria',
      icon: <MessageBubbleIcon />,
    },
    {
      label: 'Lei de Acesso à Informação',
      href: 'https://1746.staging.app.dados.rio/protocolo/lai',
      icon: <OpenBookIcon />,
      external: true,
    },
  ]

  const categorias = await fetchCategories()
  const servicos: SitemapItem[] = categorias.map(cat => ({
    label: cat.name,
    href: `/servicos/categoria/${cat.categorySlug}`,
    icon: getCategoryIcon(cat.name),
  }))

  return (
    <div className="w-full bg-background text-foreground">
      <HeaderWrapperClient />
      <Breadcrumb
        items={[
          { label: 'Página inicial', href: '/' },
          { label: 'Mapa do Site' },
        ]}
      />

      <main className="w-full max-w-4xl mx-auto px-4 pb-10">
        <h1 className="pt-2 pb-1 text-base font-medium leading-5.25 text-foreground">
          Mapa do site
        </h1>
        <p className="mb-6 text-sm font-normal leading-5 text-muted-foreground">
          Todas as páginas do PrefRio, organizadas por assunto.
        </p>

        <div className="flex flex-col gap-4">
          <SitemapSection
            id="section-informacoes"
            title="Informações"
            items={informacoes}
          />
          <SitemapSection
            id="section-servicos"
            title="Serviços"
            items={servicos}
            columns
          />

          {/* Atendimento + Oportunidades: empilhados mobile, lado a lado ≥ 896px */}
          <div
            className={
              salesforce
                ? 'grid grid-cols-1 min-[896px]:grid-cols-2 gap-4'
                : undefined
            }
          >
            {salesforce && (
              <SitemapSection
                id="section-atendimento"
                title="Atendimento"
                items={atendimento}
              />
            )}
            <SitemapSection
              id="section-oportunidades"
              title="Oportunidades Cariocas"
              items={oportunidades}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
