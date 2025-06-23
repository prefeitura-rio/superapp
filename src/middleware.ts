import { jwtDecode } from 'jwt-decode'
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

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const publicRoute = publicRoutes.find(route => route.path === path)
  const authToken = request.cookies.get('access_token')

  if (!authToken && publicRoute) {
    return NextResponse.next()
  }

  if (!authToken && !publicRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.href = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE
    return NextResponse.redirect(redirectUrl)
  }

  // Handle other authenticated cases
  if (
    authToken &&
    publicRoute &&
    publicRoute.whenAuthenticated === 'redirect'
  ) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/'
    return NextResponse.redirect(redirectUrl)
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
      return response
    }

    return NextResponse.next()
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
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
