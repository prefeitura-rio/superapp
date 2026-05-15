import { getDalCitizenCpfFirstlogin } from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

export async function GET() {
  try {
    const userInfo = await getUserInfoFromToken()

    if (!userInfo.cpf) {
      return NextResponse.json(
        { firstLogin: false, userInfo: null },
        { headers: NO_CACHE_HEADERS }
      )
    }

    const response = await getDalCitizenCpfFirstlogin(userInfo.cpf)
    const firstLogin =
      response.status === 200 ? (response.data?.firstlogin ?? false) : false

    return NextResponse.json(
      { firstLogin, userInfo: { cpf: userInfo.cpf, name: userInfo.name } },
      { headers: NO_CACHE_HEADERS }
    )
  } catch (error) {
    console.error('Error in onboarding-status API route:', error)
    return NextResponse.json(
      { firstLogin: false, userInfo: null },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}
