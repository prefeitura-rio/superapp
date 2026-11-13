'use client'

import { useHeaderData } from '@/hooks/use-header-data'
import { FloatNavigationClient } from './float-navigation-client'

export function FloatNavigationWrapper() {
  const { data } = useHeaderData()

  const walletUrl = data?.isLoggedIn
    ? '/carteira'
    : '/autenticacao-necessaria/carteira'

  return <FloatNavigationClient walletUrl={walletUrl} />
}
