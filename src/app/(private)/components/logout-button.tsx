'use client'

import { LogOut } from 'lucide-react'
import { MenuItem } from './menu-item'

export function LogoutButton() {
  const handleLogout = async () => {
    await fetch('/api/auth/logout')
    const redirectUrl = `${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL}/auth?client_id=${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_REDIRECT_URI}&response_type=code`
    window.location.href = redirectUrl
  }

  return (
    <MenuItem
      icon={<LogOut className="h-5 w-5" />}
      label="Sair"
      onClick={handleLogout}
    />
  )
}
