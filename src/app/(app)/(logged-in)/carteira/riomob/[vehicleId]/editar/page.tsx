import { buildAuthUrl } from '@/constants/url'
import { getEmailValue } from '@/helpers/email-data-helpers'
import { normalizePhoneData } from '@/helpers/phone-data-helpers'
import { getDalCitizenCpf } from '@/lib/dal'
import { formatPhone } from '@/lib/format-phone'
import { getUserInfoFromToken } from '@/lib/user-info'
import { notFound, redirect } from 'next/navigation'
import { getMockVehicleDetail } from '../../mocks/vehicles'
import { VehicleEditForm } from './vehicle-edit-form'

export const dynamic = 'force-dynamic'

interface EditarVeiculoPageProps {
  params: Promise<{ vehicleId: string }>
}

export default async function EditarVeiculoPage({
  params,
}: EditarVeiculoPageProps) {
  const { vehicleId } = await params
  const vehicle = getMockVehicleDetail(vehicleId)

  if (!vehicle) notFound()

  if (vehicle.category === 'condutor') {
    redirect(`/carteira/riomob/${vehicleId}`)
  }

  const userAuthInfo = await getUserInfoFromToken()

  if (!userAuthInfo.cpf) {
    redirect(buildAuthUrl(`/carteira/riomob/${vehicleId}/editar`))
  }

  let ownerName = vehicle.owner.name
  let ownerCpf = vehicle.owner.cpf
  let phoneDisplay = vehicle.owner.phone
  let emailDisplay = vehicle.owner.email

  try {
    const userInfoResponse = await getDalCitizenCpf(userAuthInfo.cpf)

    if (userInfoResponse.status === 200 && userInfoResponse.data) {
      const userInfo = userInfoResponse.data
      const phone = normalizePhoneData(userInfo.telefone)
      const phonePrincipal = phone.principal
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
          : phoneDisplay
      emailDisplay = emailValue || emailDisplay
    }
  } catch {
    // Mantém dados do mock quando o DAL falha em ambiente local.
  }

  return (
    <VehicleEditForm
      vehicle={vehicle}
      ownerInfo={{
        name: ownerName,
        cpf: ownerCpf,
        phoneDisplay,
        emailDisplay,
      }}
    />
  )
}
