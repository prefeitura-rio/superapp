import type { SearchResultItem } from '@/helpers/search-helpers'
import { normalizeCategorySlug } from '@/helpers/search-helpers'
import { sendGAEvent } from '@next/third-parties/google'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

/**
 * Handles navigation back from search page
 * Checks sessionStorage and document.referrer to determine the best navigation path
 */
export function handleBackNavigation(router: AppRouterInstance): void {
  if (typeof window === 'undefined') {
    router.push('/')
    return
  }

  try {
    // Check sessionStorage for previous route
    const previousRoute = sessionStorage.getItem('previousRoute')
    if (previousRoute) {
      const previousPath = previousRoute.split('?')[0] // Get pathname only
      const currentPath = window.location.pathname

      // Check if previous route is different from current and is from the same app
      if (previousPath && previousPath !== currentPath) {
        // Check if it's not a child route
        const isChildRoute = previousPath.startsWith(`${currentPath}/`)
        if (!isChildRoute) {
          // Valid previous route exists, use router.back()
          router.back()
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
            // Check if it's not a child route
            const isChildRoute = referrerPath.startsWith(`${currentPath}/`)
            if (!isChildRoute) {
              // Valid referrer exists, use router.back()
              router.back()
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

  // No valid previous route (direct access), navigate to "/"
  router.push('/')
}

/**
 * Handles click on a search result item
 * Navigates to the appropriate page based on item type
 */
export function handleSearchItemClick(
  item: SearchResultItem,
  query: string,
  router: AppRouterInstance,
  onExternalLinkClick: (url: string) => void
): void {
  // Send GA event with search details
  sendGAEvent('event', 'search_result_click', {
    search_query: query,
    result_title: item.titulo,
    result_description: item.descricao || '',
    result_type: item.tipo,
    event_timestamp: new Date().toISOString(),
  })

  // Handle external links with bottom sheet
  if (item.tipo === 'link_externo' && item.url) {
    onExternalLinkClick(item.url)
    return
  }

  // Navigate to the item based on type
  if (item.tipo === 'curso' && item.id) {
    // Navigate to course detail page
    router.push(`/servicos/cursos/${item.id}`)
  } else if (item.tipo === 'job' && item.id) {
    // Navigate to job detail page
    router.push(`/servicos/empregos/${item.id}`)
  } else if (item.tipo === 'servico' && item.category && item.slug) {
    // Normalize category name to slug format
    const categorySlug = normalizeCategorySlug(item.category)
    router.push(
      `/servicos/categoria/${encodeURIComponent(categorySlug)}/${item.slug}`
    )
  } else if (item.url) {
    window.open(item.url, '_blank')
  }
}
