import acessoInformacao from '@/assets/acesso-informacao.png'
import brasaoPrefeitura from '@/assets/brasao-prefeitura.svg'
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterXIcon,
  YoutubeIcon,
} from '@/assets/icons'
import prefRioLogo from '@/assets/pref-rio-logo.svg'
import { CARTA_DE_SERVICOS_FOOTER_LINK } from '@/constants/carta-de-servicos'
import { TERMOS_DE_USO_ROUTE } from '@/constants/termos-de-uso/platforms'
import { TICKET_FORM_BASE_URL } from '@/constants/url'
import Image from 'next/image'
import Link from 'next/link'
import { FooterPhoneButton } from './footer-phone-button'

const PREFEITURA_RIO_URL = 'https://prefeitura.rio'
const TRANSPARENCIA_URL = 'https://transparencia.prefeitura.rio/'

const quickLinks = [
  { label: 'Serviços', href: '/servicos' },
  { label: 'Oportunidades cariocas', href: '/servicos/trabalho' },
  { label: 'Ouvidoria', href: `${TICKET_FORM_BASE_URL}/ouvidoria` },
  {
    label: 'Lei de acesso à informação',
    href: `${TICKET_FORM_BASE_URL}/lai`,
  },
  { label: 'Perguntas frequentes', href: '/faq' },
  CARTA_DE_SERVICOS_FOOTER_LINK,
  { label: 'Mapa do site', href: '/mapa-do-site' },
  { label: 'Termos de uso', href: TERMOS_DE_USO_ROUTE },
  {
    label: 'Política de privacidade',
    href: TERMOS_DE_USO_ROUTE,
  },
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

const titleCls =
  'text-sm font-medium leading-4 tracking-normal text-foreground'
const bodyCls =
  'text-sm font-normal leading-5 tracking-normal text-foreground-light'
const linkCls =
  'text-sm font-normal leading-5 tracking-normal text-[var(--theme-color-card-2,#0084D1)] hover:underline'

function Divider() {
  return <div className="border-t border-border" />
}

function AddressSection() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-10">
      <div className="flex flex-col gap-1">
        <p className={titleCls}>Prefeitura da Cidade do Rio de Janeiro</p>
        <p className={bodyCls}>Rua Afonso Cavalcanti, 455</p>
        <p className={bodyCls}>Cidade Nova, Rio de Janeiro – RJ</p>
        <p className={bodyCls}>CEP: 20211-110</p>
        <p className={bodyCls}>CNPJ: 42.498.733/0001-48</p>
      </div>

      <div className="flex flex-col gap-1">
        <p className={titleCls}>Telefones para atendimento</p>
        <p className={bodyCls}>
          Município do Rio de Janeiro:{' '}
          <FooterPhoneButton number="1746" display="1746" />
        </p>
        <p className={bodyCls}>
          Demais localidades:{' '}
          <FooterPhoneButton number="(21) 3460-1746" display="(21) 3460-1746" />
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <p className={titleCls}>Horários de atendimento</p>
        <p className={bodyCls}>Agência presencial: 9h às 17h</p>
        <p className={bodyCls}>Telefonia: 24h</p>
      </div>
    </div>
  )
}

function QuickLinksSection() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-10">
      <div className="flex flex-col gap-1">
        <p className={titleCls}>Links rápidos</p>
        <ul className="flex flex-col gap-1 mt-1">
          {quickLinks.map(link => (
            <li key={link.href + link.label}>
              <Link href={link.href} className={linkCls}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-1 sm:col-start-2">
        <p className={titleCls}>Transparência</p>
        <a
          href={TRANSPARENCIA_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Acesso à Informação"
          className="mt-1"
        >
          <Image
            src={acessoInformacao}
            alt="Acesso à Informação"
            width={106}
            height={47}
            unoptimized
          />
        </a>
      </div>
    </div>
  )
}

function LogosAndSocial() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-4">
        <a
          href={PREFEITURA_RIO_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Prefeitura do Rio"
        >
          <Image
            src={brasaoPrefeitura}
            alt="Prefeitura do Rio"
            width={77}
            height={32}
            style={{ width: '77px', height: '31.233px', aspectRatio: '77/31.23' }}
            className="object-contain"
            unoptimized
          />
        </a>
        <Link href="/" aria-label="PrefRio">
          <Image
            src={prefRioLogo}
            alt="PrefRio"
            width={111}
            height={43}
            style={{ width: '105.3px', height: '42.9px' }}
            className="object-contain"
            unoptimized
          />
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <p className={titleCls}>Redes sociais</p>
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
      </div>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="w-full mt-16 pb-28 bg-background">
      <div className="max-w-4xl mx-auto px-4">
        <Divider />

        <div className="py-6">
          <AddressSection />
        </div>

        <Divider />

        <div className="py-6">
          <QuickLinksSection />
        </div>

        <Divider />

        <div className="pt-6">
          <LogosAndSocial />
        </div>
      </div>
    </footer>
  )
}
