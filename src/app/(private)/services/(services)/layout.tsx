import { PageFadeInWrapper } from '@/components/ui/page-fade-in'

export default function ServicesLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <PageFadeInWrapper>
      <main>{children}</main>
    </PageFadeInWrapper>
  )
}
