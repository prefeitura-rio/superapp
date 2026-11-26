// src/app/api/auth/callback/keycloak/route.ts
import { REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE } from '@/constants/url'
import {
  LOGIN_MARKER_COOKIE,
  LOGIN_MARKER_MAX_AGE,
  LOGIN_MARKER_VALUE,
} from '@/lib/analytics/login-marker'
import {
  getAccessTokenCookieConfig,
  getRefreshTokenCookieConfig,
} from '@/lib/auth-cookie-config'
import {
  COOKIE_CONSENT_COOKIE,
  hasConsentFor,
  parseCookieConsent,
} from '@/lib/cookie-consent/consent'
import { type NextRequest, NextResponse } from 'next/server'

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

    // Marcador curto, legível pelo cliente, para o LoginEventTracker contar o
    // login no GA uma vez. Só existe com consentimento de análise e não leva
    // dados pessoais (nada de nome, CPF ou e-mail: o GA proíbe e a LGPD exige
    // minimização).
    const consent = parseCookieConsent(
      req.cookies.get(COOKIE_CONSENT_COOKIE)?.value
    )
    if (hasConsentFor(consent, 'analytics')) {
      res.cookies.set(LOGIN_MARKER_COOKIE, LOGIN_MARKER_VALUE, {
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: LOGIN_MARKER_MAX_AGE,
      })
    }

    return res
  } catch (error) {
    // Em caso de erro (incluindo 500), redireciona para o Google
    return NextResponse.redirect(REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE)
  }
}
