import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shouldShowUpdateBadge(updatedAt?: string): boolean {
  if (!updatedAt) {
    return true // Show badge if updated_at is empty
  }

  const updatedDate = new Date(updatedAt)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  return updatedDate <= sixMonthsAgo // Show badge if updated 6+ months ago
}

/**
 * Formata o nome do usuário retornando apenas os dois primeiros nomes
 * com a primeira letra de cada nome maiúscula
 * @param userName - Nome completo do usuário
 * @returns Nome formatado com dois nomes (ex: "Lucas Tavares")
 */
export function formatUserName(userName: string): string {
  if (!userName || typeof userName !== 'string') {
    return ''
  }

  // Remove espaços extras e divide por espaços
  const names = userName.trim().split(/\s+/)

  // Pega apenas o primeiro nome
  const firstName = names[0]

  // Formata o nome: primeira letra maiúscula, resto minúscula
  if (!firstName) return ''

  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
}

/**
 * Retorna o nome de exibição do usuário, priorizando nome_exibicao se disponível,
 * caso contrário retorna o nome padrão
 * @param displayName - Nome de exibição personalizado (nome_exibicao)
 * @param defaultName - Nome padrão do usuário (name)
 * @returns Nome de exibição formatado
 */
export function getDisplayName(
  displayName?: string,
  defaultName?: string
): string {
  // Se nome_exibicao existe e não está vazio, usa ele
  if (displayName?.trim()) {
    return displayName
  }

  // Caso contrário, usa o nome padrão formatado (apenas primeiro nome)
  if (defaultName?.trim()) {
    return formatUserName(defaultName)
  }

  return ''
}

/**
 * Formata qualquer texto com a primeira letra de cada palavra em maiúscula
 * @param text - Texto a ser formatado (ex: "joao silva", "JOAO SILVA")
 * @param mode - 'all' (padrão) capitaliza cada palavra, 'first' capitaliza apenas a primeira letra
 * @returns Texto formatado
 * - mode='all': "Joao Silva"
 * - mode='first': "Joao silva"
 */
export function formatTitleCase(
  text: string,
  mode: 'all' | 'first' = 'all'
): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  const trimmed = text.trim()

  if (mode === 'first') {
    // Capitalize only the first letter, rest to lowercase
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
  }

  // mode === 'all': Capitalize first letter of each word
  const words = trimmed.split(/\s+/)

  const formattedWords = words.map(word => {
    if (!word) return ''
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  })

  return formattedWords.join(' ')
}

/**
 * Tracks the current route in sessionStorage for back navigation.
 * Call this function on route changes to maintain navigation history.
 * This is particularly useful for Next.js client-side navigation where document.referrer is not updated.
 */
export function trackRoute(currentPath: string): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const currentRoute =
      window.location.pathname + window.location.search + window.location.hash
    const storedCurrentRoute = sessionStorage.getItem('currentRoute')

    // Only update if the current route is different from what's stored
    if (storedCurrentRoute !== currentRoute) {
      // Move current route to previous route before updating
      if (storedCurrentRoute) {
        sessionStorage.setItem('previousRoute', storedCurrentRoute)
      }
      // Update the current route
      sessionStorage.setItem('currentRoute', currentRoute)
    }
  } catch (error) {
    // sessionStorage might be unavailable (private browsing, etc.)
    console.warn('Failed to track route:', error)
  }
}

/**
 * Determines the back navigation route based on tracked navigation history or referrer.
 * Uses sessionStorage to track previous routes (works with Next.js client-side navigation),
 * and falls back to document.referrer for external navigation or direct access.
 * @param defaultRoute - The default route to return when no valid previous route exists (default: '/servicos/cursos/')
 * @returns The route path to navigate back to
 */
export function getBackRoute(defaultRoute = '/servicos/cursos/'): string {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return defaultRoute
  }

  try {
    // First, try to get the previous route from sessionStorage (works with client-side navigation)
    const previousRoute = sessionStorage.getItem('previousRoute')
    if (previousRoute) {
      const currentUrl = new URL(window.location.href)
      const previousPath = previousRoute.split('?')[0] // Get pathname only for comparison
      const currentPath = currentUrl.pathname

      // If previous route is different from current, check if it's a child route
      if (previousPath !== currentPath) {
        // Check if previous route is a child route of current route (e.g., service detail is child of category list)
        // If previous route starts with current route + '/', it's a child route - skip it
        const isChildRoute = previousPath.startsWith(`${currentPath}/`)

        if (!isChildRoute) {
          return previousRoute
        }
        // If it's a child route, fall through to use defaultRoute
      }
    }
  } catch (error) {
    // sessionStorage might be unavailable, continue to referrer check
  }

  // Fallback to document.referrer for external navigation or when sessionStorage is empty
  const referrer = document.referrer

  if (!referrer) {
    return defaultRoute
  }

  try {
    const referrerUrl = new URL(referrer)
    const currentUrl = new URL(window.location.href)

    // Compare hosts (including port if present)
    const referrerHost = referrerUrl.host
    const currentHost = currentUrl.host

    // If hosts don't match, return default route
    if (referrerHost !== currentHost) {
      return defaultRoute
    }

    // Same domain - extract the path from referrer
    const referrerPath =
      referrerUrl.pathname + referrerUrl.search + referrerUrl.hash

    // If referrer is the same page, return default route
    if (
      referrerPath ===
      currentUrl.pathname + currentUrl.search + currentUrl.hash
    ) {
      return defaultRoute
    }

    // Return the referrer's path
    return referrerPath || defaultRoute
  } catch (error) {
    // Invalid URL or parsing error - return default route
    return defaultRoute
  }
}
