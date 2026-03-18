/**
 * Analytics Event Tracker
 *
 * @module analytics/tracker
 *
 * @description
 * This module provides core functionality for sending events to Google Analytics.
 * It wraps the gtag function from @next/third-parties/google with additional
 * safety checks, error handling, and debug logging.
 */

import { ANALYTICS_CONFIG, isAnalyticsEnabled, isDebugMode } from './config'
import { getTimestamp, sanitizeParam } from './context-collector'
import type {
  AnalyticsEvent,
  ServiceButtonClickParams,
  UserLoginParams,
} from './types'
import { AnalyticsEventType } from './types'

/**
 * Type definition for gtag function from @next/third-parties/google
 *
 * @remarks
 * The gtag function is injected into the window object by the GoogleAnalytics
 * component in layout.tsx. This declaration allows TypeScript to understand
 * the gtag API.
 *
 * @see https://developers.google.com/analytics/devguides/collection/gtagjs
 */
declare global {
  interface Window {
    /**
     * Google Analytics gtag function
     *
     * @param command - The gtag command ('event', 'config', or 'set')
     * @param targetId - The event name or target ID
     * @param params - Optional parameters for the command
     */
    gtag?: (
      command: 'event' | 'config' | 'set',
      targetId: string,
      params?: Record<string, unknown>
    ) => void
  }
}

/**
 * Send an event to Google Analytics
 *
 * @param event - Complete analytics event object
 * @returns True if event was sent successfully, false otherwise
 *
 * @remarks
 * This is a low-level function that handles the actual communication with
 * Google Analytics. It performs multiple safety checks before sending:
 *
 * 1. Verifies code is running client-side (not SSR)
 * 2. Checks if analytics is enabled via configuration
 * 3. Validates that gtag is available on window object
 * 4. Wraps the gtag call in try-catch for error handling
 *
 * **Important**: Use specific tracking functions like `trackServiceButtonClick`
 * instead of calling this directly, unless you're implementing a new event type.
 *
 * @example
 * ```ts
 * const event: AnalyticsEvent = {
 *   event_name: AnalyticsEventType.SERVICE_BUTTON_CLICK,
 *   user_authenticated: true,
 *   page_path: '/servicos/...',
 *   timestamp: Date.now(),
 *   event_params: { ... }
 * }
 * const success = sendEvent(event)
 * ```
 */
export function sendEvent(event: AnalyticsEvent): boolean {
  // Guard: Only run in browser
  if (typeof window === 'undefined') {
    if (isDebugMode()) {
      console.warn('[Analytics] sendEvent called on server-side, ignoring')
    }
    return false
  }

  // Guard: Check if analytics is enabled
  if (!isAnalyticsEnabled()) {
    if (isDebugMode()) {
      console.warn('[Analytics] Analytics not enabled, event not sent')
    }
    return false
  }

  // Guard: Check if gtag is available
  if (!window.gtag) {
    console.error('[Analytics] gtag not found on window object')
    return false
  }

  try {
    // Build event payload by merging base params and event-specific params
    const eventPayload = {
      ...event.event_params,
      user_authenticated: event.user_authenticated,
      page_path: event.page_path,
      timestamp: event.timestamp,
      // Enable debug mode in development to see events in GA DebugView
      debug_mode: isDebugMode(),
    }

    // Send to Google Analytics
    window.gtag('event', event.event_name, eventPayload)

    // Debug logging (development only)
    if (ANALYTICS_CONFIG.ENABLE_CONSOLE_LOGGING) {
      console.log('[Analytics] Event sent:', {
        event_name: event.event_name,
        payload: eventPayload,
      })
    }

    return true
  } catch (error) {
    console.error('[Analytics] Error sending event:', error)
    return false
  }
}

/**
 * Track a service button click event
 *
 * @param params - Service button click parameters
 * @param userAuthenticated - User authentication status
 * @param pagePath - Current page path
 * @returns True if event was tracked successfully
 *
 * @remarks
 * This function tracks when a user clicks on a service action button.
 * It automatically:
 *
 * 1. Sanitizes all string parameters to prevent PII and ensure valid length
 * 2. Adds current timestamp
 * 3. Combines service-specific params with base context
 * 4. Sends the complete event to Google Analytics
 *
 * **Privacy**: All parameters are sanitized to prevent accidental PII leakage.
 * However, developers must still ensure sensitive data is never passed in.
 *
 * @example
 * ```ts
 * // In a React component with useAnalytics hook
 * const handleClick = () => {
 *   trackServiceButtonClick({
 *     service_id: '770618f7',
 *     service_name: 'Agendamento CADRIO',
 *     service_category: 'familia',
 *     button_label: 'Acessar serviço',
 *     button_index: 0,
 *     destination_url: 'https://example.com',
 *   }, true, '/servicos/categoria/familia/service-770618f7')
 * }
 * ```
 */
export function trackServiceButtonClick(
  params: ServiceButtonClickParams,
  userAuthenticated: boolean | null,
  pagePath: string
): boolean {
  // Sanitize parameters to prevent PII and ensure valid length
  const sanitizedParams: ServiceButtonClickParams = {
    service_id: sanitizeParam(params.service_id, 50),
    service_name: sanitizeParam(params.service_name),
    service_category: sanitizeParam(params.service_category, 50),
    button_label: sanitizeParam(params.button_label),
    button_index: params.button_index,
    destination_url: sanitizeParam(params.destination_url, 200),
  }

  // Build complete event object
  const event: AnalyticsEvent = {
    event_name: AnalyticsEventType.SERVICE_BUTTON_CLICK,
    user_authenticated: userAuthenticated,
    page_path: pagePath,
    timestamp: getTimestamp(),
    event_params: sanitizedParams,
  }

  return sendEvent(event)
}

/**
 * Track a user login event
 *
 * @param params - User login parameters (user_id, user_name, login_method)
 * @param pagePath - Current page path
 * @returns True if event was tracked successfully
 *
 * @remarks
 * Fired once per authentication flow, right after the Keycloak/GovBR
 * callback sets the `just_logged_in` cookie. The cookie is consumed
 * and deleted immediately so the event is never sent twice.
 */
export function trackUserLogin(
  params: UserLoginParams,
  pagePath: string
): boolean {
  const sanitizedParams: UserLoginParams = {
    name: sanitizeParam(params.name),
    preferred_username: sanitizeParam(params.preferred_username, 50),
    email: sanitizeParam(params.email),
  }

  const event: AnalyticsEvent = {
    event_name: AnalyticsEventType.USER_LOGIN,
    user_authenticated: true,
    page_path: pagePath,
    timestamp: getTimestamp(),
    event_params: sanitizedParams,
  }

  return sendEvent(event)
}
