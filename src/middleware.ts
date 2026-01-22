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

      // TEMPORARY: Block access to "mei" routes when feature flag is enabled
      // TODO: Remove this block once the feature is ready
      // Only block routes where "mei" is a complete path segment (e.g., /mei, /servicos/mei, /mei/qualquercoisa)
      // This prevents blocking routes like "meio ambiente" which contains "mei" as a substring
      if (process.env.NEXT_PUBLIC_FEATURE_FLAG === 'true') {
        const pathSegments = path.split('/').filter(Boolean) // Split path and remove empty strings
        const hasMeiSegment = pathSegments.some(segment => segment === 'mei')

        if (hasMeiSegment) {
          const url = request.nextUrl.clone()
          url.pathname = '/not-found'

          const response = NextResponse.rewrite(url)
          response.headers.set(
            'Content-Security-Policy',
            contentSecurityPolicyHeaderValue
          )
          return response
        }
      }

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
        // Set cache headers for public pages (2 minutes, allow stale for 5 min)
        response.headers.set(
          'Cache-Control',
          'public, max-age=120, stale-while-revalidate=300'
        )
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
          span.setStatus({ code: SpanStatusCode.OK })
          span.end()
          return result
        }
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

      span.setStatus({ code: SpanStatusCode.OK })
      span.end()
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
     * - static assets (images, fonts, etc.)
     */
    {
      source:
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|gif|svg|webp)).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
