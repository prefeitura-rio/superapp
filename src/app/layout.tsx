import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Super App',
  description: 'Acesso a serviços públicos e informações.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
