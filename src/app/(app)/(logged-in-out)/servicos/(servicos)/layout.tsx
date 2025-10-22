import { FloatNavigation } from '../../../../components/float-navigation'

export default function ServicosLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div>
      <main>
        {children}
        <FloatNavigation />
      </main>
    </div>
  )
}
