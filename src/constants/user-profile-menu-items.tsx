import { CheckIcon, MapPinIcon, SettingsIcon, UserIcon } from '@/assets/icons'

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
    icon: <UserIcon className="h-5 w-5" />,
    label: 'Meus dados',
    href: '/meu-perfil/informacoes-pessoais',
  },
  {
    id: 'endereco',
    icon: <MapPinIcon className="h-5 w-5" />,
    label: 'Endereço',
    href: '/meu-perfil/endereco',
  },
  // {
  //   id: 'trabalho',
  //   icon: <Briefcase className="h-5 w-5" />,
  //   label: 'Trabalho',
  //   href: '/meu-perfil/user-job-info',
  // },
  {
    id: 'autorizacoes',
    icon: <CheckIcon className="h-5 w-5" />,
    label: 'Autorizações',
    href: '/meu-perfil/autorizacoes',
  },
  {
    id: 'configuracoes',
    icon: <SettingsIcon className="h-5 w-5" />,
    label: 'Configurações',
    href: '/meu-perfil/configuracoes',
  },
] as const
