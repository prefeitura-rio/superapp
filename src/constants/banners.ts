import { CursosBanner } from '@/app/components/banners/cursos-banner'
import { EmpregabilidadeBanner } from '@/app/components/banners/empregabilidade-banner'
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

const _featureFlag = process.env.NEXT_PUBLIC_FEATURE_FLAG ?? 'false'
const _empregosEnabled =
  _featureFlag === 'false' || _featureFlag.split(',').includes('empregos')

export const suggestedBanners: BannerProps[] = [
  {
    id: 'empregabilidade',
    component: EmpregabilidadeBanner,
    title: 'Encontre seu emprego',
    subtitle: 'no Oportunidades Cariocas',
    route: '/servicos/empregos/',
  },
  {
    id: 'cursos',
    component: CursosBanner,
    title: '',
    subtitle: '',
    route: '/servicos/cursos/',
  },
  {
    id: 'login',
    component: LoginBanner,
    title: 'Acesse sua carteira e os serviços municipais',
    subtitle: '',
    route: '/autenticacao-necessaria/carteira',
  },
  // {
  //   id: 'iptu',
  //   component: IptuBanner,
  //   title: 'Fique em dia!',
  //   subtitle: 'Emita sua guia ou saiba mais',
  //   route: '/servicos/categoria/taxas/iptu-2025-94ff5567',
  // },
  {
    id: 'update',
    component: ProfileUpdateBanner,
    title: '',
    subtitle: '',
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
].filter(banner => banner.id !== 'empregabilidade' || _empregosEnabled)
