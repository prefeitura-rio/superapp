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
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mapa do site',
  description: 'Todas as páginas do PrefRio, organizadas por assunto.',
}

interface SitemapItem {
  label: string
  href: string
  icon: React.ReactNode
  external?: boolean
}

const informacoes: SitemapItem[] = [
  {
    label: 'A Prefeitura',
    href: 'https://prefeitura.rio',
    icon: <BuildingIcon />,
    external: true,
  },
  {
    label: 'Carta de serviços',
    href: '/carta-de-servicos',
    icon: <FileTextIcon />,
  },
  {
    label: 'Perguntas frequentes',
    href: '/faq',
    icon: <HelpCircleIcon />,
  },
  {
    label: 'Termos de uso e política de privacidade',
    href: '/termos-de-uso',
    icon: <ShieldIcon />,
  },
]

const servicos: SitemapItem[] = [
  { label: 'Animais', href: '/servicos/categoria/animais', icon: <PawIcon /> },
  { label: 'Anticorrupção', href: '/servicos/categoria/central%20anticorrupcao', icon: <ShieldCheckIcon /> },
  { label: 'Cidadania', href: '/servicos/categoria/cidadania', icon: <CitizenshipIcon /> },
  { label: 'Cultura e Lazer', href: '/servicos/categoria/cultura', icon: <MusicIcon /> },
  { label: 'Defesa Civil', href: '/servicos/categoria/defesa-civil', icon: <AlertTriangleIcon /> },
  { label: 'Educação', href: '/servicos/categoria/educacao', icon: <GraduationCapIcon /> },
  { label: 'Fiscalização', href: '/servicos/categoria/fiscalizacao', icon: <EyeOpenIcon /> },
  { label: 'Imóveis', href: '/servicos/categoria/imoveis', icon: <HomeBuildingIcon /> },
  { label: 'LGPD', href: '/servicos/categoria/lei%20geral%20de%20protecao%20de%20dados%20(lgpd)', icon: <LockIcon /> },
  { label: 'Licenças e Alvarás', href: '/servicos/categoria/licencas', icon: <BadgeCheckIcon /> },
  { label: 'Meio Ambiente', href: '/servicos/categoria/meio%20ambiente', icon: <LeafIcon /> },
  { label: 'Ouvidoria', href: '/ouvidoria', icon: <MessageBubbleIcon /> },
  { label: 'Processos', href: '/servicos/categoria/processos', icon: <FolderIcon /> },
  { label: 'Saúde', href: '/servicos/categoria/saude', icon: <HeartPulseIcon /> },
  { label: 'Serviços urbanos', href: '/servicos/categoria/servicos%20urbanos', icon: <TrashBinIcon /> },
  { label: 'Servidor', href: '/servicos/categoria/servidor', icon: <IdCardIcon /> },
  { label: 'Trabalho', href: '/servicos/categoria/trabalho', icon: <SuitcaseIcon /> },
  { label: 'Trânsito', href: '/servicos/categoria/transito', icon: <CarIcon /> },
  { label: 'Transparência', href: '/servicos/categoria/transparencia', icon: <SearchZoomIcon /> },
  { label: 'Transporte', href: '/servicos/categoria/transporte', icon: <BusIcon /> },
  { label: 'Tributos', href: '/servicos/categoria/tributos', icon: <CoinIcon /> },
  { label: 'Turismo', href: '/servicos/categoria/turismo', icon: <LuggageIcon /> },
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
    <section aria-labelledby={id} className="flex flex-col gap-4 rounded-2xl bg-card p-5 h-fit">
      <h2 id={id} className="text-base font-medium leading-6 text-foreground">
        {title}
      </h2>
      <ul className={columns ? 'grid grid-cols-1 min-[896px]:grid-cols-2 gap-2' : 'flex flex-col gap-2'}>
        {items.map(item => (
          <li key={item.label}>
            <SitemapLink item={item} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function MapaDoSitePage() {
  return (
    <div className="w-full bg-background text-foreground">
      <HeaderWrapperClient />

      <main className="w-full max-w-4xl mx-auto px-4 pb-10">
        <h1 className="pt-2 pb-1 text-base font-medium leading-5.25 text-foreground">
          Mapa do site
        </h1>
        <p className="mb-6 text-sm font-normal leading-5 text-muted-foreground">
          Todas as páginas do PrefRio, organizadas por assunto.
        </p>

        <div className="flex flex-col gap-4">
          <SitemapSection id="section-informacoes" title="Informações" items={informacoes} />
          <SitemapSection id="section-servicos" title="Serviços" items={servicos} columns />

          {/* Atendimento + Oportunidades: empilhados mobile, lado a lado ≥ 896px */}
          <div className="grid grid-cols-1 min-[896px]:grid-cols-2 gap-4">
            <SitemapSection id="section-atendimento" title="Atendimento" items={atendimento} />
            <SitemapSection id="section-oportunidades" title="Oportunidades Cariocas" items={oportunidades} />
          </div>
        </div>
      </main>
    </div>
  )
}
