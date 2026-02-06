'use client'

import { useEffect, useRef } from 'react'

/**
 * Hook para refresh proativo de tokens
 * Verifica periodicamente se o usuário está logado e força refresh preventivo
 *
 * IMPORTANTE: Só deve ser usado em layouts de rotas autenticadas
 *
 * @param intervalMinutes - Intervalo em minutos para verificação (padrão: 5)
 */
export function useTokenRefresh(intervalMinutes: number = 5) {
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    const checkAndRefresh = async () => {
      try {
        // Verifica se usuário ainda está logado
        const statusResponse = await fetch('/api/user/auth-status')
        const statusData = await statusResponse.json()

        if (!statusData.isLoggedIn) {
          console.log('[useTokenRefresh] User not logged in, stopping refresh')
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
          }
          return
        }

        // Força refresh preventivo
        // O backend decide se é necessário refresh baseado no tempo restante
        await fetch('/api/auth/refresh', { method: 'POST' })
      } catch (error) {
        console.error('[useTokenRefresh] Error during token refresh check', error)
      }
    }

    // Primeira execução imediata
    checkAndRefresh()

    // Execuções periódicas
    intervalRef.current = setInterval(
      checkAndRefresh,
      intervalMinutes * 60 * 1000
    )

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [intervalMinutes])
}
