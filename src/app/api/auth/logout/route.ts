import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  // Get refresh token from cookies
  const cookieStore = cookies()
  const refreshToken = (await cookieStore).get('refresh_token')?.value

  // Call Keycloak logout endpoint if refresh token exists
  if (refreshToken) {
    const logoutUrl = `${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL}/logout`
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID!,
      client_secret: process.env.IDENTIDADE_CARIOCA_CLIENT_SECRET!,
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
  const response = new NextResponse(null, { status: 204 })
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
