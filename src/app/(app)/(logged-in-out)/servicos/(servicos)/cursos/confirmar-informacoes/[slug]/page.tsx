import { extractCourseId } from '@/actions/courses/utils-mock'
import { getApiV1CoursesCourseId } from '@/http-courses/courses/courses'
import { getDalCitizenCpf } from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'
import { notFound } from 'next/navigation'
import { ConfirmInscriptionClient } from '../components/confirm-inscription-client'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ConfirmInscriptionPage({ params }: PageProps) {
  const { slug: courseSlug } = await params
  const courseUuid = extractCourseId(courseSlug)

  const userAuthInfo = await getUserInfoFromToken()

  if (!userAuthInfo.cpf) {
    notFound()
  }

  const [userInfoResponse, courseInfoResponse] = await Promise.all([
    getDalCitizenCpf(userAuthInfo.cpf),
    getApiV1CoursesCourseId(Number.parseInt(courseSlug)),
  ])

  if (userInfoResponse.status !== 200 || courseInfoResponse.status !== 200) {
    notFound()
  }

  const userInfo = userInfoResponse.data
  const courseInfo = courseInfoResponse.data

  const transformedUserInfo = {
    cpf: userInfo.cpf || userAuthInfo.cpf,
    name: userInfo.nome || userAuthInfo.name,
    email: userInfo.email || { principal: { valor: '' } },
    phone: userInfo.telefone || { principal: { ddi: '', ddd: '', valor: '' } },
  }

  const nearbyUnits =
    (courseInfo as any).data?.locations?.map((location: any) => ({
      id: location.id,
      curso_id: location.curso_id,
      address: location.address,
      neighborhood: location.neighborhood,
      vacancies: location.vacancies,
      class_start_date: location.class_start_date,
      class_end_date: location.class_end_date,
      class_time: location.class_time,
      class_days: location.class_days,
      created_at: location.created_at,
      updated_at: location.updated_at,
    })) || []

  return (
    <ConfirmInscriptionClient
      userInfo={transformedUserInfo}
      userAuthInfo={userAuthInfo}
      nearbyUnits={nearbyUnits}
      courseInfo={courseInfo}
      courseId={courseUuid}
    />
  )
}
