import { getUserEnrollment } from '@/actions/courses/get-user-enrollment'
import { buildAuthUrl } from '@/constants/url'
import { getApiV1CoursesCourseId } from '@/http-courses/courses/courses'
import type { UserEnrollmentExtended } from '@/lib/course-utils'
import { getUserInfoFromToken } from '@/lib/user-info'
import { notFound, redirect } from 'next/navigation'
import { ChangeScheduleClient } from './components/change-schedule-client'
import type { NearbyUnit, Schedule } from './types'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ChangeSchedulePage({ params }: PageProps) {
  const { slug: courseSlug } = await params

  const userAuthInfo = await getUserInfoFromToken()

  // Redirect to auth if not logged in
  if (!userAuthInfo.cpf) {
    const returnUrl = `/servicos/cursos/${courseSlug}/trocar-turma`
    redirect(buildAuthUrl(returnUrl))
  }

  // Fetch course data
  const courseResponse = await getApiV1CoursesCourseId(
    Number.parseInt(courseSlug)
  )

  if (courseResponse.status !== 200 || !(courseResponse.data as any)?.data) {
    notFound()
  }

  const course = (courseResponse.data as any).data

  // Get user enrollment
  let userEnrollment: UserEnrollmentExtended | null = null
  try {
    userEnrollment = await getUserEnrollment(course.id)
  } catch (error) {
    console.error('Error fetching user enrollment:', error)
  }

  // Validate: user must have an approved enrollment to change schedule
  if (!userEnrollment || userEnrollment.status !== 'approved') {
    // Redirect back to course page if not approved
    redirect(`/servicos/cursos/${courseSlug}`)
  }

  const courseData = course as any
  const modality = courseData?.modalidade?.toLowerCase()
  const isOnlineCourse = modality === 'online' || modality === 'remoto'

  // Extract online classes from remote_class.schedules if available
  const onlineClasses: Schedule[] =
    isOnlineCourse && courseData?.remote_class?.schedules
      ? courseData.remote_class.schedules.map((schedule: any) => ({
          id: schedule.id,
          location_id: schedule.location_id,
          vacancies: schedule.vacancies,
          remaining_vacancies: schedule.remaining_vacancies,
          class_start_date: schedule.class_start_date,
          class_end_date: schedule.class_end_date,
          class_time: schedule.class_time || '',
          class_days: schedule.class_days || '',
          created_at: schedule.created_at,
          updated_at: schedule.updated_at,
        }))
      : []

  // Extract nearby units (locations) for presential courses
  const nearbyUnits: NearbyUnit[] =
    courseData?.locations?.map((location: any) => ({
      id: location.id,
      curso_id: location.curso_id,
      address: location.address,
      neighborhood: location.neighborhood,
      neighborhood_zone: location.neighborhood_zone,
      schedules: (location.schedules || []).map((schedule: any) => ({
        id: schedule.id,
        location_id: schedule.location_id,
        vacancies: schedule.vacancies,
        remaining_vacancies: schedule.remaining_vacancies,
        class_start_date: schedule.class_start_date,
        class_end_date: schedule.class_end_date,
        class_time: schedule.class_time || '',
        class_days: schedule.class_days || '',
        created_at: schedule.created_at,
        updated_at: schedule.updated_at,
      })),
      created_at: location.created_at,
      updated_at: location.updated_at,
    })) || []

  return (
    <ChangeScheduleClient
      course={course}
      userEnrollment={userEnrollment}
      nearbyUnits={nearbyUnits}
      onlineClasses={onlineClasses}
      courseSlug={courseSlug}
      isOnlineCourse={isOnlineCourse}
    />
  )
}
