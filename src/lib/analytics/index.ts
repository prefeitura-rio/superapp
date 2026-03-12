/**
 * Analytics Module
 *
 * @module analytics
 *
 * @description
 * This module provides Google Analytics event tracking functionality for the application.
 * It includes type-safe event tracking, automatic context collection, and SSR-safe implementation.
 *
 * ## Features
 *
 * - **Type-safe**: Full TypeScript support with strict typing
 * - **SSR-compatible**: Works correctly with Next.js server-side rendering
 * - **Privacy-first**: Automatic sanitization of parameters to prevent PII
 * - **Modular**: Clean separation of concerns across multiple files
 * - **Extensible**: Easy to add new event types as needed
 *
 * ## Quick Start
 *
 * For most use cases, use the `useAnalytics` hook in your React components:
 *
 * @example
 * ```tsx
 * import { useAnalytics } from '@/hooks/useAnalytics'
 *
 * function MyComponent() {
 *   const { trackServiceClick } = useAnalytics()
 *
 *   const handleClick = () => {
 *     trackServiceClick({
 *       service_id: '123',
 *       service_name: 'My Service',
 *       service_category: 'familia',
 *       button_label: 'Access Service',
 *       button_index: 0,
 *       destination_url: 'https://example.com',
 *     })
 *   }
 *
 *   return <button onClick={handleClick}>Click Me</button>
 * }
 * ```
 *
 * ## Module Structure
 *
 * - `types.ts` - TypeScript type definitions and enums
 * - `config.ts` - Configuration functions and constants
 * - `context-collector.ts` - Pure functions for data collection and sanitization
 * - `tracker.ts` - Core gtag wrapper and event tracking functions
 * - `index.ts` - Public API (this file)
 *
 * ## See Also
 *
 * - {@link useAnalytics} - React hook for component integration
 * - `/docs/ANALYTICS.md` - Detailed documentation in Portuguese
 */

// ============================================================================
// Type Exports
// ============================================================================

/**
 * Analytics event type definitions
 *
 * @remarks
 * These types define the structure of analytics events and their parameters.
 * Import these when you need to type-check analytics-related data.
 */
export type {
  AnalyticsEvent,
  BaseEventParams,
  NavigationContext,
  ServiceButtonClickParams,
  UserContext,
} from './types'

/**
 * Enum of supported event types
 *
 * @remarks
 * Use this enum to reference event types in a type-safe way.
 */
export { AnalyticsEventType } from './types'

// ============================================================================
// Configuration Exports
// ============================================================================

/**
 * Configuration functions and constants
 *
 * @remarks
 * These exports allow you to check analytics status and configuration.
 * Useful for conditional logic based on environment or feature flags.
 */
export {
  ANALYTICS_CONFIG,
  getGoogleAnalyticsId,
  isAnalyticsEnabled,
  isDebugMode,
} from './config'

// ============================================================================
// Tracking Function Exports
// ============================================================================

/**
 * Core tracking functions
 *
 * @remarks
 * These functions send events to Google Analytics.
 *
 * **Note**: For most use cases, prefer using the `useAnalytics` hook
 * instead of calling these functions directly. The hook automatically
 * collects context (auth status, pathname) for you.
 *
 * Direct function usage is useful when:
 * - You need to track events outside of React components
 * - You're implementing custom tracking logic
 * - You're adding a new event type
 */
export { sendEvent, trackServiceButtonClick } from './tracker'

// ============================================================================
// Context Collection Exports
// ============================================================================

/**
 * Context collection and sanitization functions
 *
 * @remarks
 * These pure functions are used internally by the tracking system but
 * are also exported for:
 * - Testing purposes
 * - Custom event implementations
 * - Manual data sanitization if needed
 *
 * Most developers won't need to use these directly.
 */
export {
  collectNavigationContext,
  collectUserContext,
  getTimestamp,
  sanitizeParam,
} from './context-collector'
