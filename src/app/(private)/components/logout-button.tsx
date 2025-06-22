'use client'

import { handleLogout } from '@/actions/logout'
import { LogOut } from 'lucide-react'
import { MenuItem } from './menu-item'

export function LogoutButton() {
  const onLogout = async () => {
    await handleLogout()
  }

  return (
    <MenuItem
      icon={<LogOut className="h-5 w-5" />}
      label="Sair"
      onClick={onLogout}
    />
  )
}
