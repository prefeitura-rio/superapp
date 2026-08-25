import { MapPinIcon, UserIcon } from '@/assets/icons'

interface UserProfileMenuItemsData {
  id: string
  icon: React.ReactNode
  label: string
  href?: string
  variant?: 'default' | 'danger'
}

/**
 * Tela "Dados pessoais". Solicitações, Autorizações, Configurações (tema),
 * FAQ e Sair saíram daqui — todos passaram a viver no menu global.
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
] as const
