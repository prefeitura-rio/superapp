/**
 * Analytics Context Collection
 *
 * @module analytics/context-collector
 *
 * @description
 * This module provides pure functions for collecting and sanitizing
 * context data for analytics events. All functions are stateless and
 * have no side effects, making them easy to test and reason about.
 */

import type { NavigationContext, UserContext } from './types'

/**
 * Collect user authentication context
 *
 * @param userContext - User context from AuthStatusProvider
 * @returns Normalized user context for analytics
 *
 * @remarks
 * This function normalizes user context data from the AuthStatusProvider.
 * Currently it's a simple pass-through, but it's kept as a separate function
 * to allow for future transformations or validations.
 *
 * @example
 * ```ts
 * const { isLoggedIn, isLoading } = useAuthStatus()
 * const userCtx = collectUserContext({ isLoggedIn, isLoading })
 * // Returns: { isLoggedIn: true, isLoading: false }
 * ```
 */
export function collectUserContext(userContext: UserContext): UserContext {
  return {
    isLoggedIn: userContext.isLoggedIn,
    isLoading: userContext.isLoading,
  }
}

/**
 * Collect navigation context from current page
 *
 * @param pathname - Current pathname from Next.js router
 * @returns Navigation context for analytics
 *
 * @remarks
 * This function normalizes navigation context from the Next.js router.
 * The pathname should not include domain, protocol, or query parameters.
 *
 * @example
 * ```ts
 * const pathname = usePathname()
 * const navCtx = collectNavigationContext(pathname)
 * // Returns: { pathname: '/servicos/categoria/familia/service-123' }
 * ```
 */
export function collectNavigationContext(pathname: string): NavigationContext {
  return {
    pathname,
  }
}

/**
 * Get current timestamp in milliseconds
 *
 * @returns Current timestamp (milliseconds since Unix epoch)
 *
 * @remarks
 * This function provides a consistent way to generate timestamps across
 * the analytics system. Using milliseconds allows for precise event ordering
 * and time-based analysis.
 *
 * @example
 * ```ts
 * const timestamp = getTimestamp()
 * console.log(timestamp) // 1678901234567
 * ```
 */
export function getTimestamp(): number {
  return Date.now()
}

/**
 * Sanitize string parameter to prevent PII leakage and ensure valid length
 *
 * @param value - String to sanitize
 * @param maxLength - Maximum allowed length (default: 100)
 * @returns Sanitized string
 *
 * @remarks
 * This function helps ensure we don't accidentally send PII to Google Analytics
 * and that all strings conform to GA's length limits. It performs the following:
 *
 * 1. Returns empty string for falsy values (null, undefined, empty string)
 * 2. Truncates strings longer than maxLength (appends "..." to indicate truncation)
 * 3. Trims whitespace from both ends
 *
 * **Privacy Note**: While this function helps prevent PII, it's not foolproof.
 * Developers must still ensure sensitive data is never passed to tracking functions.
 *
 * @example
 * ```ts
 * // Normal string
 * sanitizeParam('Hello World')
 * // Returns: "Hello World"
 *
 * // Long string (truncated)
 * sanitizeParam('A'.repeat(150), 100)
 * // Returns: "AAA...AAA..." (100 chars total)
 *
 * // String with whitespace
 * sanitizeParam('  Hello  ')
 * // Returns: "Hello"
 *
 * // Empty/null values
 * sanitizeParam('')
 * // Returns: ""
 * sanitizeParam(null as any)
 * // Returns: ""
 * ```
 */
export function sanitizeParam(value: string, maxLength = 100): string {
  // Guard: Handle falsy values
  if (!value) return ''

  // Truncate if exceeds max length
  const truncated =
    value.length > maxLength ? `${value.substring(0, maxLength - 3)}...` : value

  // Remove leading/trailing whitespace
  return truncated.trim()
}
