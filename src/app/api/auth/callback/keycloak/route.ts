// src/app/api/auth/callback/keycloak/route.ts
import { REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE } from '@/constants/url'
import {
  getAccessTokenCookieConfig,
  getRefreshTokenCookieConfig,
} from '@/lib/auth-cookie-config'
import { jwtDecode } from 'jwt-decode'
import { type NextRequest, NextResponse } from 'next/server'

interface KeycloakJwtPayload {
  sub?: string
  name?: string
  preferred_username?: string
  email?: string
}

function formatCpf(raw: string): string {
  const digits = raw.replace(/\D/g, '').padStart(11, '0')
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state') // Contains the return URL

    if (!code) return NextResponse.redirect('/')

    const tokenUrl = `${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL}/token`
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID!,
      client_secret: process.env.IDENTIDADE_CARIOCA_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_REDIRECT_URI!,
    })

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })

    if (!response.ok) return NextResponse.redirect('/')

    const data = await response.json()

    // Determine redirect destination
    const redirectUri = process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_REDIRECT_URI!
    const baseRedirect = redirectUri.replace(
      /\/api\/auth\/callback\/keycloak$/,
      ''
    )

    // Use return URL from state if available, otherwise go to home
    let finalRedirectUrl = baseRedirect
    if (state) {
      try {
        const decodedState = decodeURIComponent(state)
        // Validate it's a relative URL to prevent open redirect
        if (decodedState.startsWith('/') && !decodedState.startsWith('//')) {
          finalRedirectUrl = `${baseRedirect}${decodedState}`
        }
      } catch {
        // If decode fails, just use base redirect
      }
    }

    const res = NextResponse.redirect(finalRedirectUrl)
    res.cookies.set(
      'access_token',
      data.access_token,
      getAccessTokenCookieConfig()
    )
    res.cookies.set(
      'refresh_token',
      data.refresh_token,
      getRefreshTokenCookieConfig()
    )

    // Short-lived, non-httpOnly cookie so client JS can detect a fresh login
    // and fire a one-time GA event. Decoded server-side to avoid exposing the
    // full JWT to client code.
    try {
      const decoded = jwtDecode<KeycloakJwtPayload>(data.access_token)
      const cpf = decoded.preferred_username ?? ''
      const loginInfo = JSON.stringify({
        name: decoded.name ?? '',
        preferred_username: cpf ? formatCpf(cpf) : '',
        email: decoded.email ?? '',
      })
      res.cookies.set('just_logged_in', btoa(loginInfo), {
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60,
      })
    } catch {
      // Non-critical: if JWT decode fails, skip the analytics cookie
    }

    return res
  } catch (error) {
    // Em caso de erro (incluindo 500), redireciona para o Google
    return NextResponse.redirect(REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE)
  }
}
