import { type NextRequest, NextResponse } from 'next/server'
import { REDIRECT_WHEN_SESSION_EXPIRED_ROUTE } from '../constants/url'
import { refreshAccessToken } from './token-refresh'

export async function handleExpiredToken(
  request: NextRequest,
  refreshToken: string | undefined,
  requestHeaders: Headers,
  contentSecurityPolicyHeaderValue: string
): Promise<NextResponse> {
  // Try to refresh the token if we have a refresh token
  if (refreshToken) {
    const refreshResult = await refreshAccessToken(refreshToken)

    if (refreshResult.success && refreshResult.accessToken) {
      // Token refresh successful, create response with new tokens
      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })

      // Set new tokens in cookies
      response.cookies.set('access_token', refreshResult.accessToken, {
        httpOnly: true,
        path: '/',
      })

      if (refreshResult.newRefreshToken) {
        response.cookies.set('refresh_token', refreshResult.newRefreshToken, {
          httpOnly: true,
          path: '/',
        })
      }

      response.headers.set(
        'Content-Security-Policy',
        contentSecurityPolicyHeaderValue
      )
      // Prevent CDN caching for authenticated users (token was just refreshed)
      response.headers.set(
        'Cache-Control',
        'private, no-cache, no-store, must-revalidate, max-age=0'
      )
      response.headers.set('Vary', 'Cookie, Accept-Encoding')
      return response
    }
  }

  // Token refresh failed or no refresh token, redirect to session expired
  const redirectUrl = request.nextUrl.clone()
  redirectUrl.pathname = REDIRECT_WHEN_SESSION_EXPIRED_ROUTE
  const response = NextResponse.redirect(redirectUrl)
  response.headers.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue
  )
  return response
}
