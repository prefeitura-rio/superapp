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
      <SecondaryHeader title="Endereço" route="/meu-perfil" />
      {addressInfo?.bairro !== 'null' && addressInfo?.bairro && addressInfo ? (
        <>
          <AddressInfoCard address={addressInfo} />
          {showAddressBadge && (
            <div className="px-4 pt-2">
              <div className="bg-card p-4 rounded-xl flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z"
                    fill="#E17100"
                  />
                  <path
                    d="M12 8.99805L12 11.998"
                    stroke="#F9FAFB"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 14.6641H12.0067"
                    stroke="#F9FAFB"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-foreground text-sm leading-5 tracking-normal">
                  Seu endereço precisa ser atualizado
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <EmptyAddress />
      )}
    </div>
  )
}
