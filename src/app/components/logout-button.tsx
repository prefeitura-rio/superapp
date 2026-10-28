'use client'

import { LogoutIcon } from '@/assets/icons'
import { GOVBR_LOGOUT_ROUTE } from '@/lib/govbr-logout'
import { useState } from 'react'
import { MenuItem } from './menu-item'
export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = () => {
    if (isLoading) return // Prevent multiple clicks

    setIsLoading(true)
    window.location.assign(GOVBR_LOGOUT_ROUTE)
  }

  return (
    <MenuItem
      icon={<LogoutIcon className="h-5 w-5" />}
      label={isLoading ? 'Saindo...' : 'Sair'}
      onClick={handleLogout}
      isLast
      isLoading={isLoading}
    />
  )
}
