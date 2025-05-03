import { FloatNavigation } from './components/float-navation'

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div>
      <main>{children}</main>
      <FloatNavigation />
    </div>
  )
}
