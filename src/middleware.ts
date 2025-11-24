import { SpanStatusCode, trace } from '@opentelemetry/api'
import {
  type MiddlewareConfig,
  type NextRequest,
  NextResponse,
} from 'next/server'
import { buildAuthUrl } from './constants/url'
import { handleExpiredToken, isJwtExpired } from './lib'

const publicRoutes = [
  { path: '/', whenAuthenticated: 'next' },
  { path: '/faq', whenAuthenticated: 'next' },
  { path: '/busca/*', whenAuthenticated: 'next' },
  { path: '/servicos/*', whenAuthenticated: 'next' },
  { path: '/ouvidoria/*', whenAuthenticated: 'next' },
  { path: '/autenticacao-necessaria/carteira', whenAuthenticated: 'redirect' },
  { path: '/manifest.json', whenAuthenticated: 'next' },
  { path: '/sessao-expirada', whenAuthenticated: 'next' },
  { path: '/politicas-de-uso-de-cookies', whenAuthenticated: 'next' },
] as const

function matchRoute(pathname: string, routePath: string): boolean {
  // Handle exact match
  if (routePath === pathname) {
    return true
  }

  // Handle wildcard match (ending with /*)
  if (routePath.endsWith('/*')) {
    const baseRoute = routePath.slice(0, -2) // Remove /*
    return pathname.startsWith(`${baseRoute}/`) || pathname === baseRoute
  }

  return false
}

// Helper function to set cache-control headers for authenticated users
// This prevents CDN from caching user-specific content
function setCacheHeadersForAuthenticatedUser(
  response: NextResponse,
  hasAuthToken: boolean
): void {
  if (hasAuthToken) {
    // Prevent CDN and browser caching for authenticated users
    // This ensures each user gets their personalized content
    response.headers.set(
      'Cache-Control',
      'private, no-cache, no-store, must-revalidate, max-age=0'
    )
    response.headers.set('Vary', 'Cookie, Accept-Encoding')
  }
}

export async function middleware(request: NextRequest) {
  const tracer = trace.getTracer('citizen-portal-middleware', '0.1.0')

  return tracer.startActiveSpan('middleware.request', async span => {
    try {
      const path = request.nextUrl.pathname
      span.setAttribute('http.route', path)
      span.setAttribute('http.method', request.method)

      // Generate nonce for CSP
      const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

      // Define CSP header with nonce support
      const isDevelopment = process.env.NODE_ENV === 'development'

      // SHA256 hashes for inline scripts
      const scriptHashes = [
        'sha256-UnthrFpGFotkvMOTp/ghVMSXoZZj9Y6epaMsaBAbUtg=',
        'sha256-TtbCxulSBIRcXKJGEUTNzReCryzD01lKLU4IQV8Ips0=',
        'sha256-QaDv8TLjywIM3mKcA73bK0btmqNpUfcuwzqZ4U9KTsk=',
        'sha256-J9cZHZf5nVZbsm7Pqxc8RsURv1AIXkMgbhfrZvoOs/A=',
      ]

      const scriptSrcDirectives = [
        "'self'",
        `'nonce-${nonce}'`,
        "'strict-dynamic'",
        ...scriptHashes.map(hash => `'${hash}'`),
        ...(isDevelopment ? ["'unsafe-eval'"] : []),
      ]

      const cspHeader = `
  default-src 'self' https://*.apps.rio.gov.br/ https://storage.googleapis.com;
  script-src ${scriptSrcDirectives.join(' ')};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://*.google-analytics.com https://*.googletagmanager.com https://www.googletagmanager.com https://static.hotjar.com https://script.hotjar.com https://flagcdn.com https://*.doubleclick.net https://*.apps.rio.gov.br https://storage.googleapis.com;
  font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com https://*.hotjar.com;
  connect-src 'self' https://*.google.com/ https://www.google.com/* https://*.acesso.gov.br/ https://auth-idriohom.apps.rio.gov.br/ https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://www.googletagmanager.com https://*.hotjar.com https://*.hotjar.io https://metrics.hotjar.io wss://*.hotjar.com https://*.doubleclick.net https://*.app.dados.rio https://storage.googleapis.com;
  frame-src 'self' https://*.google.com/ https://www.google.com/* https://*.acesso.gov.br/ https://www.googletagmanager.com https://vars.hotjar.com https://*.doubleclick.net;
  media-src 'self' https://storage.googleapis.com data: blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'self' https://*.acesso.gov.br/ https://*.google-analytics.com https://*.googletagmanager.com https://www.googletagmanager.com https://www.googletagmanager.com/* https://static.hotjar.com https://script.hotjar.com https://flagcdn.com https://*.doubleclick.net;
  frame-ancestors 'self' https://*.acesso.gov.br/;
  upgrade-insecure-requests;
`.trim()

      // Clean up CSP header
      const contentSecurityPolicyHeaderValue = cspHeader
        .replace(/\s{2,}/g, ' ')
        .trim()

      const publicRoute = publicRoutes.find(route =>
        matchRoute(path, route.path)
      )
      const authToken = request.cookies.get('access_token')
      const refreshToken = request.cookies.get('refresh_token')

      span.setAttribute('route.public', !!publicRoute)
      span.setAttribute('auth.has_token', !!authToken)
      span.setAttribute('auth.has_refresh_token', !!refreshToken)

      // Set up request headers with nonce and CSP
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-nonce', nonce)
      requestHeaders.set(
        'Content-Security-Policy',
        contentSecurityPolicyHeaderValue
      )

      // Special handling for wallet routes
      if (path === '/carteira') {
        span.addEvent('wallet.route.check')
        if (!authToken) {
          // Unauthenticated user trying to access wallet → redirect to auth required page
          span.addEvent('wallet.redirect.unauthenticated')
          const redirectUrl = request.nextUrl.clone()
          redirectUrl.pathname = '/autenticacao-necessaria/carteira'
          redirectUrl.search = ''
          const response = NextResponse.redirect(redirectUrl)
          response.headers.set(
            'Content-Security-Policy',
            contentSecurityPolicyHeaderValue
          )
          span.setStatus({ code: SpanStatusCode.OK })
          span.end()
          return response
        }
        // Authenticated user accessing wallet → continue normally (will be handled below)
      }

      if (!authToken && publicRoute) {
        span.addEvent('public.route.unauthenticated')
        const response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })
        response.headers.set(
          'Content-Security-Policy',
          contentSecurityPolicyHeaderValue
        )
        // Public routes without auth can be cached
        span.setStatus({ code: SpanStatusCode.OK })
        span.end()
        return response
      }

      // Handle other authenticated cases
      if (
        authToken &&
        publicRoute &&
        publicRoute.whenAuthenticated === 'redirect'
      ) {
        span.addEvent('authenticated.redirect')
        // Handle other authenticated cases
        const redirectUrl = request.nextUrl.clone()
        // If authenticated user tries to access wallet auth page → redirect to actual wallet
        if (path === '/autenticacao-necessaria/carteira') {
          redirectUrl.pathname = '/carteira'
          span.setAttribute('redirect.target', '/carteira')
        } else {
          redirectUrl.pathname = '/'
          span.setAttribute('redirect.target', '/')
        }
        const response = NextResponse.redirect(redirectUrl)
        response.headers.set(
          'Content-Security-Policy',
          contentSecurityPolicyHeaderValue
        )
        span.setStatus({ code: SpanStatusCode.OK })
        span.end()
        return response
      }

      // logged-in-out pages (home, courses and jobs)
      if (
        authToken &&
        publicRoute &&
        (path === '/' || path.startsWith('/servicos/cursos'))
      ) {
        // Checar se o JWT está EXPIRADO
        span.addEvent('jwt.expiration.check')
        if (isJwtExpired(authToken.value)) {
          span.addEvent('jwt.expired')
          const result = await handleExpiredToken(
            request,
            refreshToken?.value,
            requestHeaders,
            contentSecurityPolicyHeaderValue
          )
          // Set cache headers for authenticated users even on token refresh
          if (result instanceof NextResponse) {
            setCacheHeadersForAuthenticatedUser(result, true)
          }
          span.setStatus({ code: SpanStatusCode.OK })
          span.end()
          return result
        }
        // Authenticated user on public route - prevent caching
        span.addEvent('authenticated.public.route')
        const response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })
        response.headers.set(
          'Content-Security-Policy',
          contentSecurityPolicyHeaderValue
        )
        setCacheHeadersForAuthenticatedUser(response, true)
        span.setStatus({ code: SpanStatusCode.OK })
        span.end()
        return response
      }

      if (authToken && !publicRoute) {
        // Check if JWT is expired
        span.addEvent('protected.route.jwt.check')
        if (isJwtExpired(authToken.value)) {
          span.addEvent('jwt.expired')
          const result = await handleExpiredToken(
            request,
            refreshToken?.value,
            requestHeaders,
            contentSecurityPolicyHeaderValue
          )
          span.setStatus({ code: SpanStatusCode.OK })
          span.end()
          return result
        }

        span.addEvent('protected.route.allowed')
        const response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })
        response.headers.set(
          'Content-Security-Policy',
          contentSecurityPolicyHeaderValue
        )
        setCacheHeadersForAuthenticatedUser(response, true)
        span.setStatus({ code: SpanStatusCode.OK })
        span.end()
        return response
      }

      if (!authToken && !publicRoute) {
        // Capture the original URL (pathname + search params) for post-login redirect
        span.addEvent('unauthenticated.redirect_to_login')
        const returnUrl = `${path}${request.nextUrl.search}`
        const authUrlWithReturn = buildAuthUrl(returnUrl)
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.href = authUrlWithReturn
        span.setAttribute('redirect.return_url', returnUrl)
        const response = NextResponse.redirect(redirectUrl)
        response.headers.set(
          'Content-Security-Policy',
          contentSecurityPolicyHeaderValue
        )
        span.setStatus({ code: SpanStatusCode.OK })
        span.end()
        return response
      }

      // Default case: continue with request
      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
      response.headers.set(
        'Content-Security-Policy',
        contentSecurityPolicyHeaderValue
      )
      // Set cache headers if authenticated
      setCacheHeadersForAuthenticatedUser(response, !!authToken)
      span.setStatus({ code: SpanStatusCode.OK })
      span.end()
      return response
    } catch (error) {
      span.recordException(error as Error)
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      })
      span.end()
      throw error
    }
  })
}

export const config: MiddlewareConfig = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    {
      source:
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
