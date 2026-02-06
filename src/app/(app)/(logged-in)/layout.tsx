import { TokenRefreshProvider } from '@/components/token-refresh-provider'

export default async function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <TokenRefreshProvider>
      <div>
        <main>{children}</main>
      </div>
    </TokenRefreshProvider>
  )
}
