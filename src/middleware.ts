import createMiddleware from 'next-intl/middleware';
import {
  type MiddlewareConfig,
  type NextRequest,
  NextResponse,
} from 'next/server'

const publicRoutes = [
  { path: '/sign-in', whenAuthenticated: 'redirect' },
  { path: '/sign-up', whenAuthenticated: 'redirect' },
  { path: '/forgot-password', whenAuthenticated: 'redirect' },
  { path: '/privacy-policy', whenAuthenticated: 'redirect' },
  { path: '/pricing', whenAuthenticated: 'next' },
] as const

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL 
  ? `${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL}/auth?client_id=${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_REDIRECT_URI}&response_type=code`
  : '/sign-in'

const intlMiddleware = createMiddleware({
  locales: ['pt-BR', 'en'],
  defaultLocale: 'pt-BR'
});

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip i18n for static files and API routes
  const shouldSkipIntl = [
    '/api/',
    '/_next/',
    '/favicon.ico',
    '/sitemap.xml',
    '/robots.txt'
  ].some(path => pathname.startsWith(path));

  if (shouldSkipIntl) {
    return NextResponse.next();
  }

  // Handle i18n routing first
  const intlResponse = intlMiddleware(request);
  
  // Extract the locale and actual path from the request
  const localePrefix = /^\/([a-z]{2}-[A-Z]{2}|[a-z]{2})/.exec(pathname);
  const actualPath = localePrefix ? pathname.slice(localePrefix[0].length) : pathname;
  
  const publicRoute = publicRoutes.find(route => route.path === actualPath)
  const authToken = request.cookies.get('access_token')

  if (!authToken && publicRoute) {
    return intlResponse;
  }

  if (!authToken && !publicRoute) {
    if (REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE.startsWith('http')) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.href = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE
      return NextResponse.redirect(redirectUrl)
    } else {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = localePrefix ? `${localePrefix[0]}${REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE}` : REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE
      return NextResponse.redirect(redirectUrl)
    }
  }

  if (
    authToken &&
    publicRoute &&
    publicRoute.whenAuthenticated === 'redirect'
  ) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = localePrefix ? `${localePrefix[0]}/` : '/'
    return NextResponse.redirect(redirectUrl)
  }

  if (authToken && !publicRoute) {
    // Checar se o JWT está EXPIRADO
    // Se sim, remover o cookie e redirecionar o usuário pro login
    // Aplicar uma estratégia de refresh

    return intlResponse;
  }
  
  return intlResponse;
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
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
