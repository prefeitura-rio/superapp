import { getDepartmentsCdUa } from '@/http/departments/departments'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ cdUa: string }> }
) {
  try {
    const { cdUa } = await params

    if (!cdUa) {
      return NextResponse.json(
        { error: 'cdUa parameter is required' },
        { status: 400 }
      )
    }

    const departmentResponse = await getDepartmentsCdUa(cdUa)

    if (departmentResponse.status !== 200) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: departmentResponse.status }
      )
    }

    return NextResponse.json({
      nome_ua: departmentResponse.data?.nome_ua,
      cd_ua: departmentResponse.data?.cd_ua,
    })
  } catch (error) {
    console.error('Error fetching department:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
