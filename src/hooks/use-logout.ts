'use client'

import { buildGovbrLogoutUrl } from '@/lib/govbr-logout'
import { useCallback, useState } from 'react'

/** Tempo máximo esperando o iframe do Gov.br antes de seguir para a home. */
const GOVBR_LOGOUT_TIMEOUT_MS = 5000

function goHome() {
  window.location.assign(process.env.NEXT_PUBLIC_HOME_URL || '/')
}

/**
 * Logout da aplicação e do Keycloak (`/api/auth/logout`), seguido do logout
 * do Gov.br num iframe oculto (ver `@/lib/govbr-logout`) e da ida à home.
 * Compartilhado entre o menu global e o botão Sair.
 */
export function useLogout() {
  const [isLoading, setIsLoading] = useState(false)

  const logout = useCallback(async () => {
    if (isLoading) return // evita cliques repetidos
    setIsLoading(true)

    try {
      await fetch('/api/auth/logout')
    } catch (error) {
      console.error('Logout failed:', error)
      setIsLoading(false)
      return
    }

    const govbrLogoutUrl = buildGovbrLogoutUrl()
    if (!govbrLogoutUrl) {
      goHome()
      return
    }

    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = govbrLogoutUrl

    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      iframe.remove()
      goHome()
    }
    iframe.onload = finish
    iframe.onerror = finish
    setTimeout(finish, GOVBR_LOGOUT_TIMEOUT_MS)

    document.body.appendChild(iframe)
  }, [isLoading])

  return { logout, isLoading }
}
