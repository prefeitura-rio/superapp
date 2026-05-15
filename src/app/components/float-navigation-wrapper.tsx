'use client'

import { useQuery } from '@tanstack/react-query'
import { FloatNavigationClient } from './float-navigation-client'

async function fetchHeaderData() {
  const res = await fetch('/api/user/header', {
    cache: 'no-store',
    credentials: 'include',
  })
  if (!res.ok) return { isLoggedIn: false }
  return res.json()
}

export function FloatNavigationWrapper() {
  const { data } = useQuery({
    queryKey: ['header'],
    queryFn: fetchHeaderData,
    staleTime: 5 * 60 * 1000,
  })

  const walletUrl = data?.isLoggedIn
    ? '/carteira'
    : '/autenticacao-necessaria/carteira'

  return <FloatNavigationClient walletUrl={walletUrl} />
}
