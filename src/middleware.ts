import { jwtDecode } from 'jwt-decode'
import {
  type MiddlewareConfig,
  type NextRequest,
  NextResponse,
} from 'next/server'
import {
  REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE,
  REDIRECT_WHEN_SESSION_EXPIRED_ROUTE,
} from './constants/url'

const publicRoutes = [
  { path: '/', whenAuthenticated: 'next' },
  { path: '/search/*', whenAuthenticated: 'next' },
  { path: '/services/*', whenAuthenticated: 'next' },
  { path: '/authentication-required/wallet', whenAuthenticated: 'redirect' },
  { path: '/manifest.json', whenAuthenticated: 'next' },
  { path: '/session-expired', whenAuthenticated: 'next' },
  { path: '/cookies-policy', whenAuthenticated: 'next' },
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

function isJwtExpired(token: string): boolean {
  try {
    const decoded: { exp?: number } = jwtDecode(token)
    if (!decoded.exp) return true // If no exp field, consider it expired
    const now = Math.floor(Date.now() / 1000)
    return decoded.exp < now
  } catch {
    return false
  }
}

export function middleware(request: NextRequest) {
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
  font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com;
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

  const path = request.nextUrl.pathname
  const publicRoute = publicRoutes.find(route => matchRoute(path, route.path))
  const authToken = request.cookies.get('access_token')

  // Set up request headers with nonce and CSP
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue
  )

  // Special handling for wallet routes
  if (path === '/wallet') {
    if (!authToken) {
      // Unauthenticated user trying to access wallet → redirect to auth required page
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/authentication-required/wallet'
      redirectUrl.search = ''
      const response = NextResponse.redirect(redirectUrl)
      response.headers.set(
        'Content-Security-Policy',
        contentSecurityPolicyHeaderValue
      )
      return response
    }
    // Authenticated user accessing wallet → continue normally (will be handled below)
  }

  if (!authToken && publicRoute) {
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
    response.headers.set(
      'Content-Security-Policy',
      contentSecurityPolicyHeaderValue
    )
    return response
  }

  // Handle other authenticated cases
  if (
    authToken &&
    publicRoute &&
    publicRoute.whenAuthenticated === 'redirect'
  ) {
    // Handle other authenticated cases
    const redirectUrl = request.nextUrl.clone()
    // If authenticated user tries to access wallet auth page → redirect to actual wallet
    if (path === '/authentication-required/wallet') {
      redirectUrl.pathname = '/wallet'
    } else {
      redirectUrl.pathname = '/'
    }
    const response = NextResponse.redirect(redirectUrl)
    response.headers.set(
      'Content-Security-Policy',
      contentSecurityPolicyHeaderValue
    )
    return response
  }

  // logged-in-out pages (home, courses and jobs)
  if (authToken && publicRoute && path === '/') {
    // Checar se o JWT está EXPIRADO
    if (isJwtExpired(authToken.value)) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = REDIRECT_WHEN_SESSION_EXPIRED_ROUTE
      const response = NextResponse.redirect(redirectUrl)
      response.headers.set(
        'Content-Security-Policy',
        contentSecurityPolicyHeaderValue
      )
      return response
    }
  }

  if (authToken && !publicRoute) {
    // Checar se o JWT está EXPIRADO
    if (isJwtExpired(authToken.value)) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = REDIRECT_WHEN_SESSION_EXPIRED_ROUTE
      const response = NextResponse.redirect(redirectUrl)
      response.headers.set(
        'Content-Security-Policy',
        contentSecurityPolicyHeaderValue
      )
      return response
    }

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
    response.headers.set(
      'Content-Security-Policy',
      contentSecurityPolicyHeaderValue
    )
    return response
  }

  if (!authToken && !publicRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.href = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE
    const response = NextResponse.redirect(redirectUrl)
    response.headers.set(
      'Content-Security-Policy',
      contentSecurityPolicyHeaderValue
    )
    return response
  }
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
