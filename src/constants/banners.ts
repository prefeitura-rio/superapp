import { IptuBanner } from '@/app/(private)/components/banners/iptu-banner'
import { LicensesBanner } from '@/app/(private)/components/banners/licenses-banner'
import { LoginBanner } from '@/app/(private)/components/banners/login-banner'
import { ProfileUpdateBanner } from '@/app/(private)/components/banners/profile-update-banner'
import { TaxesBanner } from '@/app/(private)/components/banners/taxes-banner'

type BannerProps = {
  id: string
  component: React.ComponentType
}

export const suggestedBanners: BannerProps[] = [
  {
    id: 'login',
    component: LoginBanner,
  },
  {
    id: 'iptu',
    component: IptuBanner,
  },
  {
    id: 'update',
    component: ProfileUpdateBanner,
  },
  {
    id: 'taxes',
    component: TaxesBanner,
  },
  {
    id: 'licenses',
    component: LicensesBanner,
  },
]
