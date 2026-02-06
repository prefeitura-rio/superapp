import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { refreshAccessToken } from '@/lib/token-refresh'
import {
  getAccessTokenCookieConfig,
  getRefreshTokenCookieConfig,
} from '@/lib/auth-cookie-config'

/**
 * Endpoint para refresh manual de access token
 * Permite que client-side force refresh sem depender apenas do middleware
 *
 * POST /api/auth/refresh
 * Response: { success: true } | { error: string }
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refresh_token')?.value

    if (!refreshToken) {
      console.warn('[REFRESH_ENDPOINT] No refresh token found')
      return NextResponse.json(
        { error: 'No refresh token found' },
        { status: 401 }
      )
    }

    // Attempt to refresh token with Keycloak
    const refreshResult = await refreshAccessToken(refreshToken)

    if (!refreshResult.success || !refreshResult.accessToken) {
      console.error('[REFRESH_ENDPOINT] Token refresh failed', {
        success: refreshResult.success,
        hasAccessToken: !!refreshResult.accessToken,
      })
      return NextResponse.json(
        { error: 'Token refresh failed' },
        { status: 401 }
      )
    }

    console.log('[REFRESH_ENDPOINT] Token refreshed successfully')

    // Create response with new secure cookies
    const response = NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
    })

    response.cookies.set(
      'access_token',
      refreshResult.accessToken,
      getAccessTokenCookieConfig()
    )

    if (refreshResult.newRefreshToken) {
      response.cookies.set(
        'refresh_token',
        refreshResult.newRefreshToken,
        getRefreshTokenCookieConfig()
      )
    }

    return response
  } catch (error) {
    console.error('[REFRESH_ENDPOINT] Unexpected error', {
      error: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { error: 'Internal server error during token refresh' },
      { status: 500 }
    )
  }
}
