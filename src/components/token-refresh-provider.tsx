'use client'

import { useTokenRefresh } from '@/hooks/useTokenRefresh'
import { type ReactNode } from 'react'

/**
 * Provider para refresh proativo de tokens
 * Ativa o hook useTokenRefresh para manter sessão do usuário sempre ativa
 *
 * Deve ser usado apenas em layouts de rotas autenticadas
 */
export function TokenRefreshProvider({ children }: { children: ReactNode }) {
  // Refresh a cada 5 minutos
  useTokenRefresh(5)

  return <>{children}</>
}
