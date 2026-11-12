'use client'

import { GOVBR_LOGOUT_ROUTE } from '@/lib/govbr-logout'
import { useCallback, useState } from 'react'

/**
 * Logout encadeado (aplicação → Keycloak → Gov.br) em navegação de primeiro
 * nível — ver `@/lib/govbr-logout`. Compartilhado entre o menu global e o
 * botão Sair.
 */
export function useLogout() {
  const [isLoading, setIsLoading] = useState(false)

  const logout = useCallback(() => {
    if (isLoading) return // evita cliques repetidos
    setIsLoading(true)
    window.location.assign(GOVBR_LOGOUT_ROUTE)
  }, [isLoading])

  return { logout, isLoading }
}
