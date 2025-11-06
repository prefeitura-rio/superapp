import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import { Resource } from '@opentelemetry/resources'
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions'
import { SEMRESATTRS_DEPLOYMENT_ENVIRONMENT } from '@opentelemetry/semantic-conventions'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch'
import {
  TraceIdRatioBasedSampler,
  AlwaysOnSampler,
  ParentBasedSampler,
} from '@opentelemetry/sdk-trace-base'

export async function register() {
  // Check if OpenTelemetry is enabled
  const isOtelEnabled = process.env.OTEL_ENABLED === 'true'

  if (!isOtelEnabled) {
    console.log('[OpenTelemetry] Tracing is disabled')
    return
  }

  // Get configuration from environment variables
  const collectorUrl =
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4317'
  const serviceName = process.env.OTEL_SERVICE_NAME || 'citizen-portal'
  const serviceVersion = process.env.OTEL_SERVICE_VERSION || '0.1.0'
  const environment =
    process.env.OTEL_ENVIRONMENT || process.env.NODE_ENV || 'development'

  // Configure trace sampling
  // OTEL_TRACES_SAMPLER can be: always_on, always_off, traceidratio
  // OTEL_TRACES_SAMPLER_ARG is the ratio for traceidratio (0.0 to 1.0)
  const samplerType = process.env.OTEL_TRACES_SAMPLER || 'always_on'
  const samplerArg = parseFloat(process.env.OTEL_TRACES_SAMPLER_ARG || '1.0')

  let sampler
  if (samplerType === 'traceidratio') {
    // Sample a percentage of traces (e.g., 0.1 = 10%)
    sampler = new ParentBasedSampler({
      root: new TraceIdRatioBasedSampler(samplerArg),
    })
  } else {
    // Default: always sample (development/staging)
    sampler = new ParentBasedSampler({
      root: new AlwaysOnSampler(),
    })
  }

  console.log('[OpenTelemetry] Initializing tracing...', {
    serviceName,
    serviceVersion,
    environment,
    collectorUrl,
    sampler: samplerType,
    samplerArg: samplerType === 'traceidratio' ? samplerArg : 'N/A',
  })

  // Create OTLP gRPC exporter
  const traceExporter = new OTLPTraceExporter({
    url: collectorUrl,
  })

  // Create resource with service information
  const resource = new Resource({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: serviceVersion,
    [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: environment,
  })

  // Initialize the SDK with instrumentations
  const sdk = new NodeSDK({
    resource,
    traceExporter,
    sampler,
    instrumentations: [
      // Auto-instrument HTTP requests (both incoming and outgoing)
      new HttpInstrumentation({
        ignoreIncomingRequestHook: (req) => {
          // Ignore health check and static assets
          const url = req.url || ''
          return (
            url.includes('/_next/static') ||
            url.includes('/_next/image') ||
            url.includes('/favicon.ico') ||
            url.includes('/api/health')
          )
        },
      }),
      // Auto-instrument fetch calls
      new FetchInstrumentation(),
    ],
  })

  // Start the SDK
  sdk.start()

  console.log('[OpenTelemetry] Tracing initialized successfully')

  // Gracefully shutdown on process exit
  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(() => console.log('[OpenTelemetry] Tracing terminated'))
      .catch((error) => console.error('[OpenTelemetry] Error terminating tracing', error))
      .finally(() => process.exit(0))
  })
}
