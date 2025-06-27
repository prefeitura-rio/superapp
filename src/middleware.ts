import { jwtDecode } from 'jwt-decode'
import {
  type MiddlewareConfig,
  type NextRequest,
  NextResponse,
} from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const publicRoutes = [
  { path: '/sign-in', whenAuthenticated: 'redirect' },
  { path: '/sign-up', whenAuthenticated: 'redirect' },
  { path: '/forgot-password', whenAuthenticated: 'redirect' },
  { path: '/privacy-policy', whenAuthenticated: 'redirect' },
  { path: '/pricing', whenAuthenticated: 'next' },
  { path: '/manifest.json', whenAuthenticated: 'next' },
] as const

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = `${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL}/auth?client_id=${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_REDIRECT_URI}&response_type=code`

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

// Create the internationalization middleware
const intlMiddleware = createMiddleware(routing)

export function middleware(request: NextRequest) {
  // Handle internationalization first
  const pathname = request.nextUrl.pathname
  
  // Skip i18n middleware for API routes and static assets
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return authMiddleware(request)
  }

  // Apply i18n middleware
  const response = intlMiddleware(request)
  
  // If i18n middleware redirected, return that response
  if (response && response.status !== 200) {
    return response
  }

  // Continue with auth middleware
  return authMiddleware(request)
}

function authMiddleware(request: NextRequest) {
  // Generate nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  // Define CSP header with nonce support
  const isDevelopment = process.env.NODE_ENV === 'development'

  // SHA256 hashes for inline scripts
  const scriptHashes = [
    'sha256-UnthrFpGFotkvMOTp/ghVMSXoZZj9Y6epaMsaBAbUtg=',
    'sha256-TtbCxulSBIRcXKJGEUTNzReCryzD01lKLU4IQV8Ips0=',
  ]

  const scriptSrcDirectives = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    ...scriptHashes.map(hash => `'${hash}'`),
    ...(isDevelopment ? ["'unsafe-eval'"] : []),
  ]

  const cspHeader = `
    default-src 'self';
    script-src ${scriptSrcDirectives.join(' ')};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.google-analytics.com https://*.googletagmanager.com https://www.googletagmanager.com https://static.hotjar.com https://script.hotjar.com https://flagcdn.com https://*.doubleclick.net;
    font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com;
    connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://www.googletagmanager.com https://*.hotjar.com https://*.hotjar.io https://metrics.hotjar.io wss://*.hotjar.com https://*.doubleclick.net;
    frame-src 'self' https://www.googletagmanager.com https://vars.hotjar.com https://*.doubleclick.net;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.trim()

  // Clean up CSP header
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
    .trim()

  const path = request.nextUrl.pathname
  // Remove locale prefix when checking for public routes
  const pathWithoutLocale = path.replace(/^\/[a-z]{2}/, '') || '/'
  const publicRoute = publicRoutes.find(route => route.path === pathWithoutLocale)
  const authToken = request.cookies.get('access_token')

  // Set up request headers with nonce and CSP
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue
  )

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

  // Handle other authenticated cases
  if (
    authToken &&
    publicRoute &&
    publicRoute.whenAuthenticated === 'redirect'
  ) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/'
    const response = NextResponse.redirect(redirectUrl)
    response.headers.set(
      'Content-Security-Policy',
      contentSecurityPolicyHeaderValue
    )
    return response
  }

  if (authToken && !publicRoute) {
    // Checar se o JWT está EXPIRADO
    if (isJwtExpired(authToken.value)) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.href = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE
      const response = NextResponse.redirect(redirectUrl)
      response.cookies.set('access_token', '', {
        path: '/',
        httpOnly: true,
        maxAge: 0,
      })
      response.cookies.set('refresh_token', '', {
        path: '/',
        httpOnly: true,
        maxAge: 0,
      })
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
}

export const config: MiddlewareConfig = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',
    
    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(pt|en)/:path*',
    
    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!_next|_vercel|.*\\..*).*)'
  ],
}
