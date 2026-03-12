/**
 * Analytics Module Type Definitions
 *
 * @module analytics/types
 *
 * @description
 * This module defines all TypeScript interfaces, types, and enums for the
 * Google Analytics event tracking system. It provides type-safe contracts
 * for event tracking throughout the application.
 */

/**
 * Supported Google Analytics event types
 *
 * @remarks
 * This enum defines all trackable events in the application.
 * For the POC phase, only SERVICE_BUTTON_CLICK is implemented.
 * Future event types can be added here as the system expands.
 *
 * @example
 * ```ts
 * const eventType = AnalyticsEventType.SERVICE_BUTTON_CLICK
 * ```
 */
export enum AnalyticsEventType {
  /** User clicked on a service action button */
  SERVICE_BUTTON_CLICK = 'service_button_click',

  // Future event types (not yet implemented):
  // PAGE_VIEW = 'page_view',
  // SEARCH = 'search',
}

/**
 * Base event parameters that are included in every tracked event
 *
 * @remarks
 * These parameters are automatically collected by the analytics system
 * and included in all events to provide contextual information about
 * the user session and navigation state.
 */
export interface BaseEventParams {
  /**
   * User authentication status
   *
   * @remarks
   * - `true`: User is authenticated
   * - `false`: User is not authenticated
   * - `null`: Authentication status is still loading or unknown
   */
  user_authenticated: boolean | null

  /**
   * Current page pathname
   *
   * @remarks
   * The pathname from Next.js router, without domain or query parameters.
   * Example: `/servicos/categoria/familia/service-123`
   */
  page_path: string

  /**
   * Event timestamp in milliseconds since Unix epoch
   *
   * @remarks
   * Generated using `Date.now()` when the event is tracked.
   * Can be used for time-based analysis and event ordering.
   */
  timestamp: number
}

/**
 * Service-specific event parameters for button click tracking
 *
 * @remarks
 * These parameters provide detailed information about the service
 * and button that was clicked by the user.
 */
export interface ServiceButtonClickParams {
  /**
   * Service unique identifier
   *
   * @remarks
   * From `ModelsPrefRioService.id` field. May be empty string if not available.
   */
  service_id: string

  /**
   * Service display name
   *
   * @remarks
   * From `ModelsPrefRioService.nome_servico` field.
   * Example: "Agendamento CADRIO", "Segunda Via IPTU"
   */
  service_name: string

  /**
   * Service category identifier
   *
   * @remarks
   * From `ModelsPrefRioService.tema_geral` field. Categories are dynamic
   * and fetched from the API. Common examples:
   * - "familia"
   * - "transporte"
   * - "educacao"
   * - "saude"
   * - "trabalho"
   */
  service_category: string

  /**
   * Button text/label
   *
   * @remarks
   * From `ModelsButton.titulo` field.
   * Example: "Acessar serviço", "Solicitar online"
   */
  button_label: string

  /**
   * Button position index (0-based)
   *
   * @remarks
   * The index of the button in the list of enabled buttons.
   * - `0` for the first button or single button
   * - `1, 2, 3...` for subsequent buttons in multiple button layouts
   */
  button_index: number

  /**
   * Destination URL of the button
   *
   * @remarks
   * From `ModelsButton.url_service` field.
   * Example: "https://servicos.prefeitura.rio/iptu"
   */
  destination_url: string
}

/**
 * Complete event payload sent to Google Analytics
 *
 * @remarks
 * This interface combines base parameters with event-specific parameters
 * to create the complete event object that is sent to Google Analytics.
 */
export interface AnalyticsEvent extends BaseEventParams {
  /**
   * Event type identifier
   *
   * @remarks
   * Determines which type of event is being tracked.
   * Must be one of the values from `AnalyticsEventType` enum.
   */
  event_name: AnalyticsEventType

  /**
   * Event-specific parameters
   *
   * @remarks
   * Optional object containing additional parameters specific to the event type.
   * For SERVICE_BUTTON_CLICK events, this will be `ServiceButtonClickParams`.
   */
  event_params?: ServiceButtonClickParams
}

/**
 * User context data collected from the application
 *
 * @remarks
 * This interface represents user-related context information
 * collected from the AuthStatusProvider. It mirrors the provider's
 * return type for consistency.
 */
export interface UserContext {
  /**
   * Authentication status from AuthStatusProvider
   *
   * @remarks
   * - `true`: User is logged in
   * - `false`: User is not logged in
   * - `null`: Loading state (authentication check in progress)
   */
  isLoggedIn: boolean | null

  /**
   * Whether authentication status is still being determined
   *
   * @remarks
   * - `true`: Still fetching auth status
   * - `false`: Auth status has been determined
   */
  isLoading: boolean
}

/**
 * Navigation context data
 *
 * @remarks
 * This interface represents navigation-related context information
 * collected from the Next.js router.
 */
export interface NavigationContext {
  /**
   * Current pathname from Next.js router
   *
   * @remarks
   * Example: `/servicos/categoria/familia/service-770618f7`
   * Does not include domain, protocol, or query parameters.
   */
  pathname: string
}
