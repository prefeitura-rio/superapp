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

export default async function ConfirmInscriptionPage({ params, searchParams }: PageProps) {
  const { slug: courseSlug } = await params
  const searchParamsData = await searchParams
  const preselectedLocationId = typeof searchParamsData.locationId === 'string' 
    ? searchParamsData.locationId 
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

  const nearbyUnits =
    (courseInfo as any).data?.locations?.map((location: any) => ({
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
      courseInfo={courseInfo}
      courseId={courseUuid}
      courseSlug={courseSlug}
      preselectedLocationId={preselectedLocationId}
    />
  )
}
