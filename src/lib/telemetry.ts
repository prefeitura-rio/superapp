import { trace, Span, SpanStatusCode, context } from '@opentelemetry/api'

/**
 * Get the tracer instance for the application
 */
export function getTracer() {
  return trace.getTracer('citizen-portal', '0.1.0')
}

/**
 * Create and execute a span with automatic error handling and status setting
 *
 * @param name - The name of the span
 * @param fn - The function to execute within the span
 * @param attributes - Optional attributes to add to the span
 * @returns The result of the function execution
 */
export async function withSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  const tracer = getTracer()

  return tracer.startActiveSpan(name, async (span) => {
    try {
      // Add custom attributes if provided
      if (attributes) {
        for (const [key, value] of Object.entries(attributes)) {
          span.setAttribute(key, value)
        }
      }

      // Execute the function
      const result = await fn(span)

      // Mark span as successful
      span.setStatus({ code: SpanStatusCode.OK })

      return result
    } catch (error) {
      // Record the error
      span.recordException(error as Error)
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      })

      // Re-throw the error
      throw error
    } finally {
      // Always end the span
      span.end()
    }
  })
}

/**
 * Wrap a function with tracing
 *
 * @param name - The name of the span
 * @param fn - The function to wrap
 * @param getAttributes - Optional function to get attributes from the function arguments
 * @returns A wrapped function that creates a span when called
 */
export function traced<TArgs extends any[], TReturn>(
  name: string,
  fn: (...args: TArgs) => Promise<TReturn>,
  getAttributes?: (...args: TArgs) => Record<string, string | number | boolean>
) {
  return async (...args: TArgs): Promise<TReturn> => {
    const attributes = getAttributes ? getAttributes(...args) : undefined
    return withSpan(name, () => fn(...args), attributes)
  }
}

/**
 * Add an event to the current active span
 *
 * @param name - The name of the event
 * @param attributes - Optional attributes for the event
 */
export function addSpanEvent(
  name: string,
  attributes?: Record<string, string | number | boolean>
) {
  const span = trace.getActiveSpan()
  if (span) {
    span.addEvent(name, attributes)
  }
}

/**
 * Set an attribute on the current active span
 *
 * @param key - The attribute key
 * @param value - The attribute value
 */
export function setSpanAttribute(
  key: string,
  value: string | number | boolean
) {
  const span = trace.getActiveSpan()
  if (span) {
    span.setAttribute(key, value)
  }
}

/**
 * Check if OpenTelemetry is enabled
 */
export function isTracingEnabled(): boolean {
  return process.env.OTEL_ENABLED === 'true'
}
