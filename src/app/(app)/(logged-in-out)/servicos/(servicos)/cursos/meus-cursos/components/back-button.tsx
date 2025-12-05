'use client'

import { ChevronLeftIcon } from '@/assets/icons/chevron-left-icon'
import { IconButton } from '@/components/ui/custom/icon-button'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'

/**
 * Custom back button for "Meus cursos" page that prevents navigation loops.
 * If previous route is a course detail page, uses router.back() to respect browser history.
 * Otherwise, navigates to the previous route if it exists, or "/" as fallback.
 */
export function MyCoursesBackButton() {
  const router = useRouter()
  const pathname = usePathname()

  const handleBack = () => {
    if (typeof window === 'undefined') {
      router.push('/servicos/cursos')
      return
    }

    try {
      // Check sessionStorage for previous route
      const previousRoute = sessionStorage.getItem('previousRoute')
      if (previousRoute) {
        const previousPath = previousRoute.split('?')[0] // Get pathname only
        const currentPath = pathname

        // Check if previous route is different from current
        if (previousPath && previousPath !== currentPath) {
          // Check if previous route is a course detail page
          // Course detail pages have format: /servicos/cursos/{id} or /servicos/cursos/{id}-{slug}
          const isCourseDetailPage = previousPath.match(
            /^\/servicos\/cursos\/\d+(-.*)?$/
          )

          // If we're on meus-cursos and previous route is a course detail page,
          // navigate to /servicos/cursos/opcoes (the typical entry point for "meus cursos")
          // This provides a logical navigation path and avoids loops
          if (isCourseDetailPage) {
            router.push('/servicos/cursos/opcoes')
            return
          }

          // Check if it's not a child route
          const isChildRoute = previousPath.startsWith(`${currentPath}/`)
          if (!isChildRoute) {
            // Navigate to the previous route
            router.push(previousRoute)
            return
          }
        }
      }

      // Fallback to document.referrer check
      const referrer = document.referrer
      if (referrer) {
        try {
          const referrerUrl = new URL(referrer)
          const currentUrl = new URL(window.location.href)

          // Check if referrer is from the same domain
          if (referrerUrl.origin === currentUrl.origin) {
            const referrerPath = referrerUrl.pathname
            const currentPath = currentUrl.pathname

            // Check if referrer is different from current page
            if (referrerPath !== currentPath) {
              // Check if referrer is a course detail page
              const isCourseDetailPage = referrerPath.match(
                /^\/servicos\/cursos\/\d+(-.*)?$/
              )

              // If we're on meus-cursos and referrer is a course detail page,
              // navigate to /servicos/cursos/opcoes (the typical entry point for "meus cursos")
              if (isCourseDetailPage) {
                router.push('/servicos/cursos/opcoes')
                return
              }

              // Check if it's not a child route
              const isChildRoute = referrerPath.startsWith(`${currentPath}/`)
              if (!isChildRoute) {
                router.push(referrerPath)
                return
              }
            }
          }
        } catch {
          // Invalid URL, continue to default
        }
      }
    } catch {
      // sessionStorage or other errors, continue to default
    }

    // No valid previous route, navigate to "/servicos/cursos"
    router.push('/servicos/cursos')
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background">
      <div className="max-w-4xl mx-auto px-4 py-4 md:py-6">
        <div className="flex items-center">
          <IconButton icon={ChevronLeftIcon} onClick={handleBack} />
          <h1 className="text-xl font-medium text-center flex-1 mr-12">
            Meus cursos
          </h1>
        </div>
      </div>
    </div>
  )
}

