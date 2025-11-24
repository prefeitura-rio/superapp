import { CursosBanner } from '@/app/components/banners/cursos-banner'
import { IptuBanner } from '@/app/components/banners/iptu-banner'
import { LicensesBanner } from '@/app/components/banners/licenses-banner'
import { LoginBanner } from '@/app/components/banners/login-banner'
import { ProfileUpdateBanner } from '@/app/components/banners/profile-update-banner'

type BannerProps = {
  id: string
  component: React.ComponentType<{
    onBannerClick?: () => void
    title: string
    subtitle: string
    route: string
  }>
  title: string
  subtitle: string
  route: string
}

export const suggestedBanners: BannerProps[] = [
  {
    id: 'cursos',
    component: CursosBanner,
    title: 'Cursos',
    subtitle: 'Conhecimento com certificação',
    route: '/servicos/cursos/',
  },
  {
    id: 'login',
    component: LoginBanner,
    title: 'Acesse sua carteira',
    subtitle: 'Faça login em gov.br',
    route: '/autenticacao-necessaria/carteira',
  },
  // {
  //   id: 'iptu',
  //   component: IptuBanner,
  //   title: 'Fique em dia!',
  //   subtitle: 'Emita sua guia ou saiba mais',
  //   route: '/servicos/categoria/taxas/94ff5567-17e5-47f3-8336-4ae209f1a601',
  // },
  {
    id: 'update',
    component: ProfileUpdateBanner,
    title: 'Atualize seu cadastro',
    subtitle: 'E personalize seu atendimento',
    route: '/meu-perfil/informacoes-pessoais',
  },
  // {
  //   id: 'taxes',
  //   component: TaxesBanner,
  //   title: 'Carioca em dia',
  //   subtitle: 'Desconto até 30 de agosto',
  //   route: '/',
  // },
  // {
  //   id: 'licenses',
  //   component: LicensesBanner,
  //   title: 'Regularize sua obra!',
  //   subtitle: 'E ganhe até 50% de desconto',
  //   route: '/servicos/categoria/cidade/5b6ac4fc-b4c7-4ce4-9d0a-3b6f48619694',
  // },
]
