import { getEmailValue, normalizeEmailData } from '@/helpers/email-data-helpers'
import { getPhoneValue, normalizePhoneData } from '@/helpers/phone-data-helpers'
import { getCitizenCpfPetsPetId } from '@/http/citizen/citizen'
import { getDalCitizenCpf } from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'
import { PetClientPage } from './pet-client-page'
import { PetNotFound } from './pet-not-found'

interface PetPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function PetPage({ params }: PetPageProps) {
  const userAuthInfo = await getUserInfoFromToken()
  const { slug } = await params

  let dataCitizen = null

  if (userAuthInfo.cpf) {
    dataCitizen = await getDalCitizenCpf(userAuthInfo.cpf)
  }

  const userInfoObj = {
    cpf: userAuthInfo.cpf || '',
    name: userAuthInfo.name || 'Nome não informado',
    email: 'Email não cadastrado',
    phone: 'Telefone não cadastrado',
  }

  if (dataCitizen?.status === 200) {
    const emailData = dataCitizen.data?.email || { principal: { valor: '' } }
    const telefoneData = dataCitizen.data?.telefone || {
      principal: { ddi: '', ddd: '', valor: '' },
    }

    userInfoObj.cpf = (dataCitizen.data.cpf as string) || userInfoObj.cpf
    userInfoObj.name = (dataCitizen.data.nome as string) || userInfoObj.name
    userInfoObj.email =
      getEmailValue(normalizeEmailData(emailData)) || userInfoObj.email
    userInfoObj.phone =
      getPhoneValue(normalizePhoneData(telefoneData)) || userInfoObj.phone
  }

  let uniquePet
  try {
    uniquePet = await getCitizenCpfPetsPetId(userAuthInfo.cpf, Number(slug))
  } catch (error) {
    console.error('Error fetching pet:', error)
    return <PetNotFound />
  }

  // fallback if pet not found
  if (!uniquePet || uniquePet.status !== 200 || !uniquePet.data) {
    return <PetNotFound />
  }

  const uniquePetData = uniquePet.data

  const petHasMicrochip = !!uniquePetData?.microchip_numero

  const petClinicName =
    uniquePetData?.clinica_credenciada?.nome || 'Clínica Microchipadora'

  return (
    <PetClientPage
      pet={uniquePetData}
      petClinicName={petClinicName}
      petHasMicrochip={petHasMicrochip}
      tutorInfoObj={userInfoObj}
    />
  )
}
