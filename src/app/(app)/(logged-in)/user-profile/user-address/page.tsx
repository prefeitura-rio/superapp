import { AddressInfoCard } from '@/app/components/address-info-card'
import { EmptyAddress } from '@/app/components/empty-address'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { getDalCitizenCpf } from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'
import { shouldShowUpdateBadge } from '@/lib/utils'

export default async function UserAddress() {
  const userAuthInfo = await getUserInfoFromToken()
  let userInfo
  let addressInfo = null
  if (userAuthInfo.cpf) {
    try {
      const response = await getDalCitizenCpf(userAuthInfo.cpf)
      if (response.status === 200) {
        userInfo = response.data
        addressInfo = userInfo?.endereco?.principal
      } else {
        console.error('Failed to fetch user data status:', response.data)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const showAddressBadge = addressInfo
    ? shouldShowUpdateBadge(addressInfo.updated_at)
    : false

  return (
    <div className="max-w-4xl min-h-lvh mx-auto pt-24 flex flex-col space-y-6">
      <SecondaryHeader title="Endereço" />
      {addressInfo?.bairro !== 'null' && addressInfo?.bairro && addressInfo ? (
        <AddressInfoCard address={addressInfo} showBadge={showAddressBadge} />
      ) : (
        <EmptyAddress />
      )}
    </div>
  )
}
