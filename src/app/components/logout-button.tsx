'use client'

import { LogoutIcon } from '@/assets/icons'
import { useLogout } from '@/hooks/use-logout'
import { MenuItem } from './menu-item'

export function LogoutButton() {
  const { logout, isLoading } = useLogout()

  return (
    <MenuItem
      icon={<LogoutIcon className="h-5 w-5" />}
      label={isLoading ? 'Saindo...' : 'Sair'}
      onClick={logout}
      isLast
      isLoading={isLoading}
    />
  )
}
