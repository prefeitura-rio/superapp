import { AuthHeaderProvider } from '@/providers/auth-header-provider'

export default function MeuPerfilLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthHeaderProvider>{children}</AuthHeaderProvider>
}
