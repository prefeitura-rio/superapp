import { buildAuthUrl } from '@/constants/url'
import {
  getEmailValue,
  hasValidEmail,
  normalizeEmailData,
} from '@/helpers/email-data-helpers'
import { hasValidPhone, normalizePhoneData } from '@/helpers/phone-data-helpers'
import type {
  ModelsEmailPrincipal,
  ModelsTelefonePrincipal,
} from '@/http/models'
import { getDalCitizenCpf } from '@/lib/dal'
import { isUpdatedWithin } from '@/lib/date'
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
  const email = normalizeEmailData(userInfo.email)
  const phonePrincipal = phone.principal as ModelsTelefonePrincipal | null
  const emailPrincipal = email.principal as ModelsEmailPrincipal | null

  const phoneOk =
    hasValidPhone(phone) &&
    isUpdatedWithin({
      updatedAt: phonePrincipal?.updated_at || null,
      months: 6,
    })

  const emailOk =
    hasValidEmail(email) &&
    isUpdatedWithin({
      updatedAt: emailPrincipal?.updated_at || null,
      months: 6,
    })

  const emailValue = getEmailValue(userInfo.email)

  const phoneDisplay =
    phonePrincipal?.ddi && phonePrincipal?.ddd && phonePrincipal?.valor
      ? formatPhone(
          phonePrincipal.ddi,
          phonePrincipal.ddd,
          phonePrincipal.valor
        )
      : 'Informe seu celular'

  const emailDisplay = emailValue || 'Informe seu e-mail'

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
        emailDisplay,
        ownerPhone,
        ownerEmail: emailValue,
        phoneNeedsUpdate: !phoneOk,
        emailNeedsUpdate: !emailOk,
      }}
    />
  )
}
