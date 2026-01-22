import { setFirstLoginFalse } from '@/actions/first-login'
import { CookieConsent } from '@/components/cookie-consent'
import { RouteTracker } from '@/components/route-tracker'
import { getDalCitizenCpfFirstlogin } from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'
import Onboarding from '../components/on-boarding'
import { SessionExpiredHandler } from '../components/session-expired-handler'

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const userInfo = await getUserInfoFromToken()

  let firstLogin = false

  if (userInfo.cpf) {
    try {
      const response = await getDalCitizenCpfFirstlogin(userInfo.cpf)
      if (response.status === 200) {
        firstLogin = response.data?.firstlogin ?? false
      } else {
        console.error('Failed to fetch first login status:', response.data)
      }
    } catch (error) {
      console.error('Error fetching first login data:', error)
    }
  }

  if (firstLogin && userInfo.cpf) {
    return (
      <main className="flex max-w-[600px] mx-auto flex-col bg-background text-foreground">
        <Onboarding
          userInfo={userInfo}
          setFirstLoginFalse={setFirstLoginFalse}
        />
      </main>
    )
  }

  return (
    <div>
      <RouteTracker />
      <SessionExpiredHandler />
      <CookieConsent variant="mini" />
      <main>{children}</main>
    </div>
  )
}
