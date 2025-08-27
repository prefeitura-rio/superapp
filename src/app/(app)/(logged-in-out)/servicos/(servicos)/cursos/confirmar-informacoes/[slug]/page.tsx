import coursesApi from '@/actions/courses'
import { extractCourseId } from '@/actions/courses/utils-mock'
import { ConfirmInscriptionClient } from '../components/confirm-inscription-client'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ConfirmInscriptionPage({ params }: PageProps) {
  const { slug: courseSlug } = await params
  const courseUuid = extractCourseId(courseSlug)
  const [userInfo, nearbyUnits] = await Promise.all([
    coursesApi.getUserInfo(),
    coursesApi.getNearbyUnits(courseUuid),
  ])

  return (
    <ConfirmInscriptionClient
      userInfo={userInfo}
      nearbyUnits={nearbyUnits}
      courseId={courseUuid}
    />
  )
}
