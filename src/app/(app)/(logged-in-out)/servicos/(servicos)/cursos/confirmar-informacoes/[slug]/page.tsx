import coursesApi from '@/actions/courses'
import { extractCourseId } from '@/actions/courses/utils-mock'
import { getDalCitizenCpf } from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'
import { ConfirmInscriptionClient } from '../components/confirm-inscription-client'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ConfirmInscriptionPage({ params }: PageProps) {
  const { slug: courseSlug } = await params
  const courseUuid = extractCourseId(courseSlug)
  const userAuthInfo = await getUserInfoFromToken()

  let userInfoObj = userAuthInfo
  const promises = [coursesApi.getNearbyUnits(courseUuid)]

  if (userAuthInfo.cpf) {
    promises.push(getDalCitizenCpf(userAuthInfo.cpf))
  }

  const results = await Promise.all(promises)
  const nearbyUnits = results[0]
  const dataCitizen = results[1]

  if (dataCitizen && dataCitizen.status === 200) {
    userInfoObj = {
      ...userAuthInfo,
      ...dataCitizen.data,
    }
  }

  return (
    <ConfirmInscriptionClient
      userInfo={userInfoObj}
      nearbyUnits={nearbyUnits}
      courseId={courseUuid}
      courseSlug={courseSlug}
    />
  )
}
