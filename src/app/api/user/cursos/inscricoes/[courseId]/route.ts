import { getApiV1CoursesCourseIdEnrollments } from '@/http-courses/inscricoes/inscricoes'
import { getUserInfoFromToken } from '@/lib/user-info'
import { NextResponse } from 'next/server'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const courseIdNum = Number.parseInt(courseId, 10)

    if (Number.isNaN(courseIdNum)) {
      return NextResponse.json(
        { enrollment: null },
        { status: 400, headers: NO_CACHE_HEADERS }
      )
    }

    const userInfo = await getUserInfoFromToken()

    if (!userInfo.cpf) {
      return NextResponse.json(
        { enrollment: null },
        { headers: NO_CACHE_HEADERS }
      )
    }

    const response = await getApiV1CoursesCourseIdEnrollments(
      courseIdNum,
      { search: userInfo.cpf, limit: 1 },
      { cache: 'no-store' }
    )

    if (response.status !== 200 || !response.data) {
      return NextResponse.json(
        { enrollment: null },
        { headers: NO_CACHE_HEADERS }
      )
    }

    const data = response.data as any
    const enrollments = data?.data?.enrollments || []
    const enrollment =
      enrollments.find((e: any) => e.cpf === userInfo.cpf) || null

    return NextResponse.json({ enrollment }, { headers: NO_CACHE_HEADERS })
  } catch (error) {
    console.error('Error fetching course enrollment:', error)
    return NextResponse.json(
      { enrollment: null },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}
