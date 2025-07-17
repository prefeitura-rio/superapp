'use client'

import { LogOut } from 'lucide-react'
import { MenuItem } from './menu-item'

export function LogoutButton() {
  const handleLogout = async () => {
    // TODO: add redirectUri to govbr
    try {
      // uri de redirecionamento do keycloak
      const redirectUri =
        'https://auth-idriohom.apps.rio.gov.br/auth/realms/idrio_cidadao/protocol/openid-connect/auth?client_id=superapp&redirect_uri=https://staging.app.dados.rio/api/auth/callback/keycloak&response_type=code'
      // primeiro faz logout do keycloak
      await fetch('/api/auth/logout')
      // depois faz logout do gov.br via iframe oculto
      const govbrLogoutUrl = `https://sso.staging.acesso.gov.br/logout?post_logout_redirect_uri=${encodeURIComponent(redirectUri)}`
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = govbrLogoutUrl
      document.body.appendChild(iframe)
      //remover o iframe após o carregamento
      iframe.onload = () => {
        setTimeout(() => {
          document.body.removeChild(iframe)
          // Redireciona o usuário após o logout do govbr
          const redirectUrl = `${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL}/auth?client_id=${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_REDIRECT_URI}&response_type=code`
          window.location.href = redirectUrl
        }, 0) // coloca em ultima prioridade na stack de execução
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <MenuItem
      icon={<LogOut className="h-5 w-5" />}
      label="Sair"
      onClick={handleLogout}
    />
  )
}
