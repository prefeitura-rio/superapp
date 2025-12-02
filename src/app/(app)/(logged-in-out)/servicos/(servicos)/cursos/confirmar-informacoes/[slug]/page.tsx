import { extractCourseId } from '@/actions/courses/utils'
import { buildAuthUrl } from '@/constants/url'
import { normalizeEmailData } from '@/helpers/email-data-helpers'
import { normalizePhoneData } from '@/helpers/phone-data-helpers'
import { getApiV1CoursesCourseId } from '@/http-courses/courses/courses'
import type {
  ModelsEmailPrincipal,
  ModelsTelefonePrincipal,
} from '@/http/models'
import { getDalCitizenCpf } from '@/lib/dal'
import { isUpdatedWithin } from '@/lib/date'
import { getUserInfoFromToken } from '@/lib/user-info'
import { notFound, redirect } from 'next/navigation'
import { ConfirmInscriptionClient } from '../components/confirm-inscription-client'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ConfirmInscriptionPage({
  params,
  searchParams,
}: PageProps) {
  const { slug: courseSlug } = await params
  const searchParamsData = await searchParams
  const preselectedLocationId =
    typeof searchParamsData.locationId === 'string'
      ? searchParamsData.locationId
      : undefined
  const preselectedClassId =
    typeof searchParamsData.classId === 'string'
      ? searchParamsData.classId
      : undefined
  const courseUuid = extractCourseId(courseSlug)

  const userAuthInfo = await getUserInfoFromToken()

  if (!userAuthInfo.cpf) {
    // Redirect to auth with return URL to come back here after login
    const returnUrl = `/servicos/cursos/confirmar-informacoes/${courseSlug}`
    redirect(buildAuthUrl(returnUrl))
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
    email: normalizeEmailData(userInfo.email),
    phone: normalizePhoneData(userInfo.telefone),
  }

  const phoneNeedsUpdate = !isUpdatedWithin({
    updatedAt:
      (transformedUserInfo.phone.principal as ModelsTelefonePrincipal)
        ?.updated_at || null,
    months: 6, // Phone must be updated every 6 months
  })

  const emailNeedsUpdate = !isUpdatedWithin({
    updatedAt:
      (transformedUserInfo.email.principal as ModelsEmailPrincipal)
        ?.updated_at || null,
    months: 6, // Email must be updated every 6 months
  })

  const contactUpdateStatus = {
    phoneNeedsUpdate,
    emailNeedsUpdate,
  }

  const courseData = (courseInfo as any).data
  const modality = courseData?.modalidade?.toLowerCase()
  const isOnlineCourse = modality === 'online' || modality === 'remoto'

  // Extract online classes from remote_class.schedules if available
  const onlineClasses =
    isOnlineCourse && courseData?.remote_class?.schedules
      ? courseData.remote_class.schedules.map((schedule: any) => ({
          id: schedule.id,
          location_id: schedule.location_id,
          vacancies: schedule.vacancies,
          class_start_date: schedule.class_start_date,
          class_end_date: schedule.class_end_date,
          class_time: schedule.class_time || '',
          class_days: schedule.class_days || '',
          created_at: schedule.created_at,
          updated_at: schedule.updated_at,
        }))
      : []

  const nearbyUnits =
    courseData?.locations?.map((location: any) => ({
      id: location.id,
      curso_id: location.curso_id,
      address: location.address,
      neighborhood: location.neighborhood,
      schedules: location.schedules || [],
      created_at: location.created_at,
      updated_at: location.updated_at,
    })) || []

  return (
    <ConfirmInscriptionClient
      userInfo={transformedUserInfo}
      contactUpdateStatus={contactUpdateStatus}
      userAuthInfo={userAuthInfo}
      nearbyUnits={nearbyUnits}
      onlineClasses={onlineClasses}
      courseInfo={courseInfo}
      courseId={courseUuid}
      courseSlug={courseSlug}
      preselectedLocationId={preselectedLocationId}
      preselectedClassId={preselectedClassId}
    />
  )
}
