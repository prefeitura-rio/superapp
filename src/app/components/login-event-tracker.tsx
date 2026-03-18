'use client'

import { trackUserLogin } from '@/lib/analytics'
import type { UserLoginParams } from '@/lib/analytics'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

function getAndClearLoginCookie(): UserLoginParams | null {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith('just_logged_in='))

  if (!match) return null

  // Delete the cookie immediately to prevent duplicate events
  document.cookie = 'just_logged_in=; path=/; max-age=0'

  try {
    const encoded = match.split('=')[1]
    const decoded = JSON.parse(atob(decodeURIComponent(encoded)))
    return {
      name: decoded.name ?? '',
      preferred_username: decoded.preferred_username ?? '',
      email: decoded.email ?? '',
    }
  } catch {
    return null
  }
}

export function LoginEventTracker() {
  const pathname = usePathname()

  useEffect(() => {
    const loginData = getAndClearLoginCookie()
    if (loginData) {
      trackUserLogin(loginData, pathname)
    }
  }, [pathname])

  return null
}
