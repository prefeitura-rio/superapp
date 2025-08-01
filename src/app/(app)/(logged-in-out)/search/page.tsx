import SearchWithRecaptcha from '@/app/components/search-with-recaptcha'
import { getUserInfoFromToken } from '@/lib/user-info'

export default async function Search() {
  const userAuthInfo = await getUserInfoFromToken()
  const isLoggedIn = !!(userAuthInfo.cpf && userAuthInfo.name)

  return <SearchWithRecaptcha isLoggedIn={isLoggedIn} />
}
