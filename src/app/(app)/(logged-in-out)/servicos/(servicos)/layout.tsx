'use client'

import { FloatNavigationWrapper } from '@/app/components/float-navigation-wrapper'
import { OportunidadesSearchPlaceholder } from '@/app/components/oportunidades/oportunidades-search-placeholder'
import {
  getVisibleOportunidadesTabs,
  isOportunidadesListing,
  resolveOportunidadesSection,
} from '@/app/components/oportunidades/oportunidades-sections'
import { OportunidadesSubHeader } from '@/app/components/oportunidades/oportunidades-sub-header'
import { OportunidadesTypeToggle } from '@/app/components/oportunidades/oportunidades-type-toggle'
import { AuthHeaderProvider } from '@/providers/auth-header-provider'
import { usePathname } from 'next/navigation'

export default function ServicosLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const section = resolveOportunidadesSection(pathname)

  if (section) {
    const showListingChrome = isOportunidadesListing(pathname)
    const hasMultipleTabs = getVisibleOportunidadesTabs().length > 1
    const searchInHeader = showListingChrome && Boolean(section.searchButton)

    return (
      <AuthHeaderProvider>
        <div>
          <OportunidadesSubHeader
            menuHref={section.menuHref}
            logoHref={section.logoHref}
            searchButtonUrl={searchInHeader ? section.searchUrl : undefined}
          />
          <div
            style={{
              background:
                'linear-gradient(180deg, var(--card) 0%, var(--background) 100%)',
              backgroundSize: '100% 210px',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {showListingChrome &&
              (hasMultipleTabs ? (
                <div className="max-w-4xl mx-auto pb-0">
                  {!searchInHeader && (
                    <OportunidadesSearchPlaceholder
                      searchUrl={section.searchUrl}
                    />
                  )}
                  <div className="mb-5 mt-5 px-4">
                    <OportunidadesTypeToggle activeType={section.id} />
                  </div>
                </div>
              ) : (
                <div className="h-20 sm:h-24" />
              ))}
            <main>{children}</main>
            {showListingChrome && <FloatNavigationWrapper />}
          </div>
        </div>
      </AuthHeaderProvider>
    )
  }

  return (
    <AuthHeaderProvider>
      <div>
        <main>{children}</main>
      </div>
    </AuthHeaderProvider>
  )
}
