import { FloatNavigation } from './components/float-navation'
import MainHeader from './components/main-header'

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div>
      <MainHeader />
      <main className="pt-15">{children}</main>
      <FloatNavigation />
    </div>
  )
}
