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
import { getCadmicroVehicle } from '@/lib/cadmicro/vehicle-service'
import { getDalCitizenCpf } from '@/lib/dal'
import { isUpdatedWithin } from '@/lib/date'
import { formatPhone } from '@/lib/format-phone'
import { getUserInfoFromToken } from '@/lib/user-info'
import { notFound, redirect } from 'next/navigation'
import { VehicleEditForm } from './vehicle-edit-form'

export const dynamic = 'force-dynamic'

interface EditarVeiculoPageProps {
  params: Promise<{ vehicleId: string }>
}

export default async function EditarVeiculoPage({
  params,
}: EditarVeiculoPageProps) {
  const { vehicleId } = await params
  const userAuthInfo = await getUserInfoFromToken()

  if (!userAuthInfo.cpf) {
    redirect(buildAuthUrl(`/carteira/cadmicro/${vehicleId}/editar`))
  }

  const vehicle = await getCadmicroVehicle(userAuthInfo.cpf, vehicleId)

  if (!vehicle) notFound()

  if (vehicle.category === 'condutor') {
    redirect(`/carteira/cadmicro/${vehicleId}`)
  }

  let ownerName = vehicle.owner.name
  let ownerCpf = vehicle.owner.cpf
  let phoneDisplay = 'Informe seu celular'
  let emailDisplay = 'Informe seu e-mail'
  let phoneNeedsUpdate = true
  let emailNeedsUpdate = true

  try {
    const userInfoResponse = await getDalCitizenCpf(userAuthInfo.cpf)

    if (userInfoResponse.status === 200 && userInfoResponse.data) {
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

      ownerName = userInfo.nome || userAuthInfo.name || ownerName
      ownerCpf = userInfo.cpf || userAuthInfo.cpf || ownerCpf
      phoneDisplay =
        phonePrincipal?.ddi && phonePrincipal?.ddd && phonePrincipal?.valor
          ? formatPhone(
              phonePrincipal.ddi,
              phonePrincipal.ddd,
              phonePrincipal.valor
            )
          : 'Informe seu celular'
      emailDisplay = emailValue || 'Informe seu e-mail'
      phoneNeedsUpdate = !phoneOk
      emailNeedsUpdate = !emailOk
    }
  } catch {
    // Mantém placeholders quando o DAL falha em ambiente local.
  }

  return (
    <VehicleEditForm
      vehicle={vehicle}
      ownerInfo={{
        name: ownerName,
        cpf: ownerCpf,
        phoneDisplay,
        emailDisplay,
        phoneNeedsUpdate,
        emailNeedsUpdate,
      }}
    />
  )
}
