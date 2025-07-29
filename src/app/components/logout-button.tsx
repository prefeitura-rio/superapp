'use client'

import { LogoutIcon } from '@/assets/icons'
import { useState } from 'react'
import { MenuItem } from './menu-item'

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    if (isLoading) return // Prevent multiple clicks

    setIsLoading(true)
    // TODO: add redirectUri to govbr
    try {
      // uri de redirecionamento do keycloak
      const redirectUri = `${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL}/auth?client_id=${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_REDIRECT_URI}&response_type=code`
      // primeiro faz logout do keycloak
      await fetch('/api/auth/logout')
      // depois faz logout do gov.br via iframe oculto
      const govbrLogoutUrl = `${process.env.NEXT_PUBLIC_GOVBR_BASE_URL}logout?post_logout_redirect_uri=${encodeURIComponent(redirectUri)}`
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = govbrLogoutUrl
      document.body.appendChild(iframe)
      //remover o iframe após o carregamento
      iframe.onload = () => {
        setTimeout(() => {
          document.body.removeChild(iframe)
          // Redireciona o usuário após o logout do govbr
          window.location.href = redirectUri
        }, 0) // coloca em ultima prioridade na stack de execução
      }
    } catch (error) {
      console.error('Logout failed:', error)
      setIsLoading(false) // Reset loading state on error
    }
  }

  return (
    <MenuItem
      icon={<LogoutIcon className="h-5 w-5" />}
      label={isLoading ? 'Saindo...' : 'Sair'}
      onClick={handleLogout}
      isLoading={isLoading}
    />
  )
}
