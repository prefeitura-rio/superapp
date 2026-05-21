import { getApiV1EnrollmentsUserCpf } from '@/http-courses/enrollments/enrollments'
import { getUserInfoFromToken } from '@/lib/user-info'
import { NextResponse } from 'next/server'

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
        { enrollments: [] },
        { headers: NO_CACHE_HEADERS }
      )
    }

    const response = await getApiV1EnrollmentsUserCpf(userInfo.cpf, {
      page: 1,
      limit: 100,
    })

    if (response.status !== 200) {
      return NextResponse.json(
        { enrollments: [] },
        { headers: NO_CACHE_HEADERS }
      )
    }

    const data = response.data as any
    const enrollments = data?.data?.enrollments || []

    return NextResponse.json({ enrollments }, { headers: NO_CACHE_HEADERS })
  } catch (error) {
    console.error('Error fetching user enrollments:', error)
    return NextResponse.json(
      { enrollments: [] },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}
