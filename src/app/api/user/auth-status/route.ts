import { getUserInfoFromToken } from '@/lib/user-info'
import { NextResponse } from 'next/server'

// Disable Next.js caching - auth endpoints must always return fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const userAuthInfo = await getUserInfoFromToken()
    const isLoggedIn = !!(userAuthInfo.cpf && userAuthInfo.name)

    return NextResponse.json(
      { isLoggedIn },
      {
        headers: {
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    )
  } catch (error) {
    console.error('Error in auth-status API route:', error)
    return NextResponse.json(
      { isLoggedIn: false, error: 'Failed to check auth status' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    )
  }
}
