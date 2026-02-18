'use client'

import { useAuthHeader } from '@/providers/auth-header-provider'
import { FloatNavigationClient } from './float-navigation-client'

export function FloatNavigationWrapper() {
  const { data } = useAuthHeader()

  // Determine the correct wallet URL based on authentication status
  const walletUrl = data.isLoggedIn
    ? '/carteira'
    : '/autenticacao-necessaria/carteira'

  return <FloatNavigationClient walletUrl={walletUrl} />
}
