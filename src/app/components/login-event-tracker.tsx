'use client'

import { trackUserLogin } from '@/lib/analytics'
import { LOGIN_MARKER_COOKIE } from '@/lib/analytics/login-marker'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Conta o login no Google Analytics uma única vez por autenticação.
 *
 * Só é montado por `ConsentGatedAnalytics`, depois do GA, quando há
 * consentimento de análise. O marcador `just_logged_in` não tem dados
 * pessoais: só indica que o login acabou de acontecer.
 */
export function LoginEventTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (consumeLoginMarker()) trackUserLogin(pathname)
  }, [pathname])

  return null
}

function consumeLoginMarker(): boolean {
  const hasMarker = document.cookie
    .split('; ')
    .some(row => row.startsWith(`${LOGIN_MARKER_COOKIE}=`))

  if (!hasMarker) return false

  // Apaga na hora para o evento não ser enviado duas vezes.
  document.cookie = `${LOGIN_MARKER_COOKIE}=; path=/; max-age=0`
  return true
}
