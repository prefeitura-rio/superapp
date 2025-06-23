'use server'

import { getEnv } from '@/env/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function handleLogout() {
  const env = await getEnv()

  // Get refresh token from cookies
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refresh_token')?.value

  // Call Keycloak logout endpoint if refresh token exists
  if (refreshToken) {
    const logoutUrl = `${env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL}/logout`
    const clientId = env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID
    const clientSecret = process.env.IDENTIDADE_CARIOCA_CLIENT_SECRET!

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    })

    try {
      await fetch(logoutUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      })
    } catch (e) {
      console.error('Error logging out from Keycloak:', e)
    }
  }

  // Clear authentication cookies
  cookieStore.set('access_token', '', {
    path: '/',
    httpOnly: true,
    maxAge: 0,
  })
  cookieStore.set('refresh_token', '', {
    path: '/',
    httpOnly: true,
    maxAge: 0,
  })

  // Build the redirect URL using validated environment variables
  const redirectUrl = `${env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL}/auth?client_id=${env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID}&redirect_uri=${env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_REDIRECT_URI}&response_type=code`

  // Redirect to the external logout URL
  redirect(redirectUrl)
}
