'use client'

/**
 * Analytics Hook
 *
 * @module hooks/useAnalytics
 *
 * @description
 * Custom React hook for tracking analytics events with automatic context collection.
 * This hook provides a simple, type-safe API for tracking user interactions
 * throughout the application.
 */

import type { ServiceButtonClickParams } from '@/lib/analytics'
import { trackServiceButtonClick } from '@/lib/analytics'
import { useAuthStatus } from '@/providers/auth-status-provider'
import { usePathname } from 'next/navigation'
import { useCallback } from 'react'

/**
 * Result object returned by useAnalytics hook
 *
 * @remarks
 * This interface defines the return value of the useAnalytics hook.
 * It provides tracking functions along with the auto-collected context data.
 */
interface UseAnalyticsResult {
  /**
   * Track a service button click event
   *
   * @param params - Service button click parameters
   * @returns True if event was tracked successfully
   *
   * @remarks
   * This function automatically includes:
   * - User authentication status (from AuthStatusProvider)
   * - Current page pathname (from Next.js router)
   * - Timestamp (generated automatically)
   *
   * You only need to provide the service-specific parameters.
   *
   * **Privacy Note**: All parameters are automatically sanitized to prevent
   * PII leakage. However, developers must still ensure sensitive data is
   * never passed to this function.
   *
   * @example
   * ```tsx
   * const { trackServiceClick } = useAnalytics()
   *
   * <Button onClick={() => trackServiceClick({
   *   service_id: service.id,
   *   service_name: service.nome_servico,
   *   service_category: service.tema_geral,
   *   button_label: 'Access Service',
   *   button_index: 0,
   *   destination_url: button.url_service,
   * })}>
   *   Access Service
   * </Button>
   * ```
   */
  trackServiceClick: (params: ServiceButtonClickParams) => boolean

  /**
   * User authentication status
   *
   * @remarks
   * Automatically collected from AuthStatusProvider.
   * - `true`: User is authenticated
   * - `false`: User is not authenticated
   * - `null`: Authentication status is loading
   *
   * This value is included automatically in all tracked events.
   */
  isLoggedIn: boolean | null

  /**
   * Current page pathname
   *
   * @remarks
   * Automatically collected from Next.js router using usePathname().
   * Example: `/servicos/categoria/familia/service-123`
   *
   * This value is included automatically in all tracked events.
   */
  pathname: string
}

/**
 * Custom hook for tracking analytics events with automatic context collection
 *
 * @returns Object with tracking functions and context data
 *
 * @remarks
 * This hook provides a simple, type-safe API for tracking analytics events
 * in React components. It automatically collects contextual information:
 *
 * - **User authentication status**: From AuthStatusProvider
 * - **Current page pathname**: From Next.js router (usePathname)
 *
 * All tracking functions are memoized with useCallback for optimal performance,
 * ensuring they maintain stable references across re-renders.
 *
 * ## Performance Considerations
 *
 * The hook uses `useCallback` to memoize tracking functions, with dependencies
 * on `isLoggedIn` and `pathname`. This means:
 *
 * - Tracking functions are stable unless auth status or pathname changes
 * - Safe to use in dependency arrays of other hooks
 * - No unnecessary re-renders of child components
 *
 * ## Usage Pattern
 *
 * 1. Call the hook at the top of your component
 * 2. Destructure the tracking functions you need
 * 3. Call tracking functions in event handlers
 * 4. Context (auth, pathname) is collected automatically
 *
 * @example
 * ```tsx
 * function ServiceButton({ service, button }) {
 *   const { trackServiceClick } = useAnalytics()
 *
 *   const handleClick = () => {
 *     trackServiceClick({
 *       service_id: service.id || '',
 *       service_name: service.nome_servico,
 *       service_category: service.tema_geral,
 *       button_label: button.titulo || '',
 *       button_index: 0,
 *       destination_url: button.url_service || '',
 *     })
 *   }
 *
 *   return (
 *     <a href={button.url_service} onClick={handleClick}>
 *       {button.titulo}
 *     </a>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Multiple buttons with index tracking
 * function ServiceButtons({ service, buttons }) {
 *   const { trackServiceClick } = useAnalytics()
 *
 *   const handleButtonClick = (button: ModelsButton, index: number) => {
 *     trackServiceClick({
 *       service_id: service.id || '',
 *       service_name: service.nome_servico,
 *       service_category: service.tema_geral,
 *       button_label: button.titulo || '',
 *       button_index: index,
 *       destination_url: button.url_service || '',
 *     })
 *   }
 *
 *   return (
 *     <>
 *       {buttons.map((button, index) => (
 *         <a
 *           key={index}
 *           href={button.url_service}
 *           onClick={() => handleButtonClick(button, index)}
 *         >
 *           {button.titulo}
 *         </a>
 *       ))}
 *     </>
 *   )
 * }
 * ```
 */
export function useAnalytics(): UseAnalyticsResult {
  // Auto-collect user context from AuthStatusProvider
  const { isLoggedIn } = useAuthStatus()

  // Auto-collect navigation context from Next.js router
  const pathname = usePathname()

  /**
   * Track service button click with auto-collected context
   *
   * @remarks
   * This function is memoized with useCallback to maintain stable reference.
   * It will only be recreated if isLoggedIn or pathname changes.
   */
  const trackServiceClick = useCallback(
    (params: ServiceButtonClickParams): boolean => {
      return trackServiceButtonClick(params, isLoggedIn, pathname)
    },
    [isLoggedIn, pathname]
  )

  return {
    trackServiceClick,
    isLoggedIn,
    pathname,
  }
}
