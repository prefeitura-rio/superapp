import { CheckIcon, MapPinIcon, UserIcon } from '@/assets/icons'

interface UserProfileMenuItemsData {
  id: string
  icon: React.ReactNode
  label: string
  href?: string
  variant?: 'default' | 'danger'
}

/**
 * Tela "Dados pessoais". Solicitações, Configurações (tema), FAQ e Sair saíram
 * daqui e passaram a viver no menu global. Autorizações continua aqui, no
 * mesmo lugar de antes (decisão de produto: o menu global não tem esse item).
 */
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
  {
    id: 'autorizacoes',
    icon: <CheckIcon className="h-5 w-5" />,
    label: 'Autorizações',
    href: '/meu-perfil/autorizacoes',
  },
] as const
