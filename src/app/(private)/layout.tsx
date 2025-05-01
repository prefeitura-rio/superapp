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
      {children}
      <FloatNavigation />
    </div>
  )
}
