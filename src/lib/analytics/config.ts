/**
 * Analytics Module Configuration
 *
 * @module analytics/config
 *
 * @description
 * This module contains all configuration constants and functions for the
 * analytics module. Configuration values are sourced from environment
 * variables when available.
 */

/**
 * Check if Google Analytics is enabled and properly configured
 *
 * @returns True if GA ID is present and code is running in browser
 *
 * @remarks
 * This function performs multiple checks:
 * 1. Verifies code is running client-side (not SSR)
 * 2. Checks for presence of Google Analytics ID in environment
 * 3. Validates the ID is not empty
 *
 * Events will only be sent if this function returns `true`.
 *
 * @example
 * ```ts
 * if (isAnalyticsEnabled()) {
 *   // Safe to send analytics events
 *   trackEvent(...)
 * }
 * ```
 */
export function isAnalyticsEnabled(): boolean {
  // Guard: Only run in browser environment
  if (typeof window === 'undefined') return false

  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID

  return Boolean(gaId && gaId.length > 0)
}

/**
 * Get the Google Analytics measurement ID
 *
 * @returns GA measurement ID or empty string if not configured
 *
 * @remarks
 * The measurement ID should be in the format: `G-XXXXXXXXXX`
 * This is configured via the `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` environment variable.
 *
 * @example
 * ```ts
 * const gaId = getGoogleAnalyticsId()
 * console.log(gaId) // "G-ABC123XYZ"
 * ```
 */
export function getGoogleAnalyticsId(): string {
  return process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ''
}

/**
 * Check if debug mode is enabled
 *
 * @returns True if running in development mode
 *
 * @remarks
 * Debug mode enables additional console logging for analytics events.
 * This helps developers verify that events are being tracked correctly
 * during local development.
 *
 * Debug mode is automatically enabled when `NODE_ENV === 'development'`.
 *
 * @example
 * ```ts
 * if (isDebugMode()) {
 *   console.log('[Analytics] Event sent:', eventData)
 * }
 * ```
 */
export function isDebugMode(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * Analytics module configuration constants
 *
 * @remarks
 * These constants control various aspects of the analytics module behavior.
 * They are used internally by the tracking functions.
 *
 * @property ENABLE_CONSOLE_LOGGING - Whether to log events to console in debug mode
 * @property MAX_PARAM_LENGTH - Maximum length for event parameter strings
 * @property TRACKING_TIMEOUT - Default timeout for event tracking operations (ms)
 */
export const ANALYTICS_CONFIG = {
  /**
   * Whether to log events to console in debug mode
   *
   * @remarks
   * Automatically enabled in development environment.
   * Helps developers verify analytics implementation.
   */
  ENABLE_CONSOLE_LOGGING: isDebugMode(),

  /**
   * Maximum length for event parameter strings to prevent truncation
   *
   * @remarks
   * Google Analytics has limits on parameter string lengths.
   * This ensures we truncate strings proactively to avoid data loss.
   * Default: 100 characters
   */
  MAX_PARAM_LENGTH: 100,

  /**
   * Default timeout for event tracking operations (milliseconds)
   *
   * @remarks
   * Not currently used, but reserved for future implementations
   * where we might want to add timeout handling for async operations.
   * Default: 1000ms (1 second)
   */
  TRACKING_TIMEOUT: 1000,
} as const
