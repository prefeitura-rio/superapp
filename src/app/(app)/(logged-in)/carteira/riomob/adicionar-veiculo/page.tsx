import { buildAuthUrl } from '@/constants/url'
import { getEmailValue } from '@/helpers/email-data-helpers'
import { normalizePhoneData } from '@/helpers/phone-data-helpers'
import { getDalCitizenCpf } from '@/lib/dal'
import { formatPhone } from '@/lib/format-phone'
import { getUserInfoFromToken } from '@/lib/user-info'
import { redirect } from 'next/navigation'
import { VehicleRegistrationFlow } from './vehicle-registration-flow'

export const dynamic = 'force-dynamic'

export default async function AdicionarVeiculoPage() {
  const userAuthInfo = await getUserInfoFromToken()

  if (!userAuthInfo.cpf) {
    redirect(buildAuthUrl('/carteira/riomob/adicionar-veiculo'))
  }

  const userInfoResponse = await getDalCitizenCpf(userAuthInfo.cpf)

  if (userInfoResponse.status !== 200 || !userInfoResponse.data) {
    throw new Error('Failed to fetch user data')
  }

  const userInfo = userInfoResponse.data
  const phone = normalizePhoneData(userInfo.telefone)
  const phonePrincipal = phone.principal
  const emailValue = getEmailValue(userInfo.email)

  const phoneDisplay =
    phonePrincipal?.ddi && phonePrincipal?.ddd && phonePrincipal?.valor
      ? formatPhone(
          phonePrincipal.ddi,
          phonePrincipal.ddd,
          phonePrincipal.valor
        )
      : 'Informação indisponível'

  const ownerPhone =
    phonePrincipal?.ddd && phonePrincipal?.valor
      ? `${phonePrincipal.ddd}${phonePrincipal.valor}`
      : undefined

  return (
    <VehicleRegistrationFlow
      ownerInfo={{
        cpf: userInfo.cpf || userAuthInfo.cpf,
        name: userInfo.nome || userAuthInfo.name || '',
        phoneDisplay,
        emailDisplay: emailValue || 'Informação indisponível',
        ownerPhone,
        ownerEmail: emailValue,
      }}
    />
  )
}
