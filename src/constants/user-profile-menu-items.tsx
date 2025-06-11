import { CheckCircle, MapIcon, Settings, User } from 'lucide-react'

interface UserProfileMenuItemsData {
  id: string
  icon: React.ReactNode
  label: string
  href?: string
  variant?: 'default' | 'danger'
}

export const USER_PROFILE_MENU_ITEMS: UserProfileMenuItemsData[] = [
  {
    id: 'meus-dados',
    icon: <User className="h-5 w-5" />,
    label: 'Meus dados',
    href: '/user-profile/user-personal-info',
  },
  {
    id: 'endereco',
    icon: <MapIcon className="h-5 w-5" />,
    label: 'Endereço',
    href: '/user-profile/user-address',
  },
  // {
  //   id: 'trabalho',
  //   icon: <Briefcase className="h-5 w-5" />,
  //   label: 'Trabalho',
  //   href: '/user-profile/user-job-info',
  // },
  {
    id: 'autorizacoes',
    icon: <CheckCircle className="h-5 w-5" />,
    label: 'Autorizações',
    href: '/user-profile/user-authorizations',
  },
  {
    id: 'configuracoes',
    icon: <Settings className="h-5 w-5" />,
    label: 'Configurações',
    href: '/user-profile/user-settings',
  },
] as const
