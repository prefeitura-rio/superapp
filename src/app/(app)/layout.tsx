import { CookieConsent } from '@/components/cookie-consent'
import { RouteTracker } from '@/components/route-tracker'
import { ReactQueryProvider } from '@/providers/query-client-provider'
import { OnboardingWrapperClient } from '../components/onboarding-wrapper-client'
import { SessionExpiredHandler } from '../components/session-expired-handler'

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ReactQueryProvider>
      <OnboardingWrapperClient>
        <div>
          <RouteTracker />
          <SessionExpiredHandler />
          <CookieConsent variant="mini" />
          <main>{children}</main>
        </div>
      </OnboardingWrapperClient>
    </ReactQueryProvider>
  )
}
