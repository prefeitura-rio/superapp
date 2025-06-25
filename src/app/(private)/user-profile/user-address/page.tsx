import { PageFadeInWrapper } from '@/components/ui/page-fade-in'
import { getCitizenCpf } from '@/http/citizen/citizen'
import { getUserInfoFromToken } from '@/lib/user-info'
import { AddressInfoCard } from '../../components/address-info-card'
import { EmptyAddress } from '../../components/empty-address'
import { SecondaryHeader } from '../../components/secondary-header'

export default async function UserAddress() {
  const userAuthInfo = await getUserInfoFromToken()
  let userInfo
  let addressInfo = null
  if (userAuthInfo.cpf) {
    try {
      const response = await getCitizenCpf(userAuthInfo.cpf, {
        cache: 'force-cache',
        next: { tags: ['update-user-address'] },
      })
      if (response.status === 200) {
        userInfo = response.data
        addressInfo = userInfo?.endereco?.principal || null
      } else {
        console.error('Failed to fetch user data status:', response.data)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  return (
    <PageFadeInWrapper>
      <div className="max-w-md min-h-lvh mx-auto pt-24 flex flex-col space-y-6">
        <SecondaryHeader title="Endereço" />
        {addressInfo?.bairro !== 'null' ? (
          <AddressInfoCard address={addressInfo} showBadge />
        ) : (
          <EmptyAddress />
        )}
      </div>
    </PageFadeInWrapper>
  )
}
