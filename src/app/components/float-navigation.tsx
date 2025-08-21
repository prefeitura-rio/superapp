import { getUserInfoFromToken } from '@/lib/user-info'
import { FloatNavigationClient } from './float-navigation-client'

export async function FloatNavigation() {
  // Check if user is authenticated by getting user info
  const userInfo = await getUserInfoFromToken()
  const isAuthenticated = !!(userInfo.cpf && userInfo.name)

  // Determine the correct wallet URL based on authentication status
  const walletUrl = isAuthenticated
    ? '/carteira'
    : '/autenticacao-necessaria/carteira'

  return <FloatNavigationClient walletUrl={walletUrl} />
}
