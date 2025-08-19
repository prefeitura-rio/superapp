// app/confirm-inscription/page.tsx
import { getNearbyUnits, getUserInfo } from './actions'
import { ConfirmInscriptionClient } from './components/confirm-inscription-client'

export default async function ConfirmInscriptionPage() {
  const [userInfo, nearbyUnits] = await Promise.all([
    getUserInfo(),
    getNearbyUnits(),
  ])

  return (
    <ConfirmInscriptionClient userInfo={userInfo} nearbyUnits={nearbyUnits} />
  )
}
