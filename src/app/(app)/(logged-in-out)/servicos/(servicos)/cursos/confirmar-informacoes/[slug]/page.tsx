import coursesApi from '@/actions/courses'
import { extractCourseId } from '@/actions/courses/utils-mock'
import { ConfirmInscriptionClient } from '../components/confirm-inscription-client'
import { getUserInfoFromToken } from '@/lib/user-info'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ConfirmInscriptionPage({ params }: PageProps) {
  const { slug: courseSlug } = await params
  const courseUuid = extractCourseId(courseSlug)
  const [userInfo, nearbyUnits, userAuthInfo] = await Promise.all([
    coursesApi.getUserInfo(),
    coursesApi.getNearbyUnits(courseUuid),
    getUserInfoFromToken(),
  ])

  return (
    <ConfirmInscriptionClient
      userInfo={userInfo}
      userAuthInfo={userAuthInfo}
      nearbyUnits={nearbyUnits}
      courseId={courseUuid}
    />
  )
}
