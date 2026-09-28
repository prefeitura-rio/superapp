import { TokenRefreshProvider } from '@/components/token-refresh-provider'
import { AuthHeaderProvider } from '@/providers/auth-header-provider'

export default async function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <TokenRefreshProvider>
      <AuthHeaderProvider>
        <div>
          <main>{children}</main>
        </div>
      </AuthHeaderProvider>
    </TokenRefreshProvider>
  )
}
