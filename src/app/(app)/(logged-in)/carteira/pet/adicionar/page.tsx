import { buildAuthUrl } from '@/constants/url'
import { hasValidEmail, normalizeEmailData } from '@/helpers/email-data-helpers'
import { hasValidPhone, normalizePhoneData } from '@/helpers/phone-data-helpers'
import type {
  ModelsEmailPrincipal,
  ModelsTelefonePrincipal,
} from '@/http/models'
import { getDalCitizenCpf } from '@/lib/dal'
import { isUpdatedWithin } from '@/lib/date'
import { getUserInfoFromToken } from '@/lib/user-info'
import { redirect } from 'next/navigation'
import { PetRegistrationFlow } from './pet-registration-flow'

export const dynamic = 'force-dynamic'

export default async function AdicionarPetPage() {
  const userAuthInfo = await getUserInfoFromToken()

  if (!userAuthInfo.cpf) {
    redirect(buildAuthUrl('/carteira/pet/adicionar'))
  }

  const userInfoResponse = await getDalCitizenCpf(userAuthInfo.cpf)

  if (userInfoResponse.status !== 200 || !userInfoResponse.data) {
    throw new Error('Failed to fetch user data')
  }

  const userInfo = userInfoResponse.data

  const userInfoExtended = userInfo as typeof userInfo & {
    genero?: string
    renda_familiar?: string
    escolaridade?: string
    deficiencia?: string
  }

  const transformedUserInfo = {
    cpf: userInfo.cpf || userAuthInfo.cpf,
    name: userInfo.nome || userAuthInfo.name,
    email: normalizeEmailData(userInfo.email),
    phone: normalizePhoneData(userInfo.telefone),
    genero: userInfoExtended.genero,
    escolaridade: userInfoExtended.escolaridade,
    renda_familiar: userInfoExtended.renda_familiar,
    deficiencia: userInfoExtended.deficiencia,
  }

  const isValidValue = (value: string | null | undefined): boolean => {
    if (!value) return false
    const trimmed = String(value).trim()
    return trimmed !== '' && trimmed.toLowerCase() !== 'null'
  }

  const phoneNeedsUpdate = !isUpdatedWithin({
    updatedAt:
      (transformedUserInfo.phone.principal as ModelsTelefonePrincipal)
        ?.updated_at || null,
    months: 6,
  })

  const emailNeedsUpdate = !isUpdatedWithin({
    updatedAt:
      (transformedUserInfo.email.principal as ModelsEmailPrincipal)
        ?.updated_at || null,
    months: 6,
  })

  const hasValidPhoneField =
    !phoneNeedsUpdate && hasValidPhone(transformedUserInfo.phone)
  const hasValidEmailField =
    !emailNeedsUpdate && hasValidEmail(transformedUserInfo.email)
  const hasGender = isValidValue(transformedUserInfo.genero)
  const hasEducation = isValidValue(transformedUserInfo.escolaridade)
  const hasFamilyIncome = isValidValue(transformedUserInfo.renda_familiar)
  const hasDisability = isValidValue(transformedUserInfo.deficiencia)

  const shouldShowConfirmationScreen =
    !hasValidPhoneField ||
    !hasValidEmailField ||
    !hasGender ||
    !hasEducation ||
    !hasFamilyIncome ||
    !hasDisability

  const contactUpdateStatus = {
    phoneNeedsUpdate,
    emailNeedsUpdate,
  }

  return (
    <PetRegistrationFlow
      shouldShowConfirmation={shouldShowConfirmationScreen}
      confirmSlideProps={{
        userInfo: transformedUserInfo,
        userAuthInfo,
        contactUpdateStatus,
      }}
    />
  )
}
