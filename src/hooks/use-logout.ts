'use client'

import { useCallback, useState } from 'react'

/**
 * Encerra a sessão no Keycloak e, em seguida, no gov.br via iframe oculto.
 * Compartilhado entre o menu global e a tela de perfil.
 */
export function useLogout() {
  const [isLoading, setIsLoading] = useState(false)

  const logout = useCallback(async () => {
    if (isLoading) return
    setIsLoading(true)

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
      // remover o iframe após o carregamento
      iframe.onload = () => {
        setTimeout(() => {
          document.body.removeChild(iframe)
          // Redireciona o usuário após o logout do govbr
          window.location.href = `${process.env.NEXT_PUBLIC_HOME_URL}`
        }, 0) // coloca em ultima prioridade na stack de execução
      }
    } catch (error) {
      console.error('Logout failed:', error)
      setIsLoading(false) // Reset loading state on error
    }
  }, [isLoading])

  return { logout, isLoading }
}
