import brasaoPrefeitura from '@/assets/brasao-prefeitura.svg'
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterXIcon,
  YoutubeIcon,
} from '@/assets/icons'
import prefRioLogo from '@/assets/pref-rio-logo.svg'
import Image from 'next/image'
import Link from 'next/link'

const menuLinks = [
  { label: 'Página inicial', href: '/' },
  { label: 'Serviços', href: '/servicos' },
]

const atendimentoLinks = [
  { label: '1746', href: 'https://1746.rio/', external: true },
  { label: 'Ouvidoria', href: '/ouvidoria', external: false },
  {
    label: 'Lei de Acesso à Informação',
    href: 'https://www.rio.rj.gov.br/web/cgm/lai',
    external: true,
  },
  { label: 'Perguntas frequentes', href: '/faq', external: false },
]

const socialLinks = [
  {
    icon: InstagramIcon,
    label: 'Instagram',
    href: 'https://www.instagram.com/prefeitura_rio/',
  },
  {
    icon: FacebookIcon,
    label: 'Facebook',
    href: 'https://www.facebook.com/PrefeituradoRio/',
  },
  {
    icon: LinkedinIcon,
    label: 'LinkedIn',
    href: 'https://br.linkedin.com/company/prefeituradorio',
  },
  {
    icon: TwitterXIcon,
    label: 'X (Twitter)',
    href: 'https://x.com/Prefeitura_Rio',
  },
  {
    icon: YoutubeIcon,
    label: 'YouTube',
    href: 'https://www.youtube.com/prefeiturario',
  },
]

function Logos() {
  return (
    <div className="flex items-center gap-4">
      <Image
        src={brasaoPrefeitura}
        alt="Prefeitura do Rio"
        width={77}
        height={32}
        style={{ width: '77px', height: '31.233px', aspectRatio: '77/31.23' }}
        className="object-contain"
        unoptimized
      />
      <Image
        src={prefRioLogo}
        alt="PrefRio"
        width={111}
        height={43}
        style={{ width: '105.3px', height: '42.9px' }}
        className="object-contain"
        unoptimized
      />
    </div>
  )
}

function SocialLinks() {
  return (
    <div className="flex items-center gap-4">
      {socialLinks.map(({ icon: Icon, label, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="text-primary transition-colors"
        >
          <Icon width={24} height={24} />
        </a>
      ))}
    </div>
  )
}

function NavSection({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string; external?: boolean }[]
}) {
  return (
    <div className="flex flex-col">
      <p className="text-sm font-medium leading-none tracking-normal text-foreground mb-2">
        {title}
      </p>
      <ul className="flex flex-col">
        {links.map(link => (
          <li key={link.href} className="mt-1">
            <Link
              href={link.href}
              {...(link.external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              className="text-sm font-normal leading-none tracking-normal text-foreground-light hover:underline"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function LegalRow() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
      <p className="text-sm font-normal leading-5 tracking-normal text-foreground">
        ©2026 PrefRio. Todos os direitos reservados.
      </p>
      <div className="flex items-center gap-2">
        <span className="text-sm font-normal leading-5 tracking-normal text-foreground-light cursor-default select-none">
          Termos de uso
        </span>
        <span className="text-sm text-foreground-light">•</span>
        <span className="text-sm font-normal leading-5 tracking-normal text-foreground-light cursor-default select-none">
          Política de Privacidade
        </span>
      </div>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="w-full pb-28">
      <div className="max-w-4xl mx-auto px-4">
        <div className="border-t border-border" />

        {/* ── MOBILE (< sm) ── */}
        <div className="sm:hidden flex flex-col pt-6 pb-6 gap-12">
          <Logos />

          <div className="flex flex-col gap-6">
            <NavSection title="Menu" links={menuLinks} />
            <NavSection title="Atendimento" links={atendimentoLinks} />
          </div>

          <SocialLinks />

          <div className="flex flex-col gap-6">
            <div className="border-t border-border" />
            <LegalRow />
          </div>
        </div>

        {/* ── DESKTOP (≥ sm) ── */}
        <div className="hidden sm:flex flex-col pt-6 pb-6">
          <div className="flex items-stretch">
            <div className="flex flex-col justify-between items-start flex-1 self-stretch">
              <Logos />
              <SocialLinks />
            </div>

            <div className="flex gap-6">
              <NavSection title="Menu" links={menuLinks} />
              <NavSection title="Atendimento" links={atendimentoLinks} />
            </div>
          </div>

          <div className="flex flex-col gap-6 mt-6">
            <div className="border-t border-border" />
            <LegalRow />
          </div>
        </div>
      </div>
    </footer>
  )
}
