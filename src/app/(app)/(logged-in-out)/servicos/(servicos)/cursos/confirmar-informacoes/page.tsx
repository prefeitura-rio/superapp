import coursesApi from '@/actions/courses'
import { ConfirmInscriptionClient } from './components/confirm-inscription-client'

export default async function ConfirmInscriptionPage() {
  const mockId = '12345' // Mock ID do curso selecionado
  const [userInfo, nearbyUnits] = await Promise.all([
    coursesApi.getUserInfo(),
    coursesApi.getNearbyUnits(mockId),
  ])

  return (
    <ConfirmInscriptionClient
      userInfo={userInfo}
      nearbyUnits={nearbyUnits}
      courseId="curso-123"
    />
  )
}
