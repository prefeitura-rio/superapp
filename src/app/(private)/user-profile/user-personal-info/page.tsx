import { CustomInput } from '@/components/ui/custom/custom-input'
import { getCitizenCpf } from '@/http/citizen/citizen'
import { formatCpf } from '@/lib/format-cpf'
import { formatPhone } from '@/lib/format-phone'
import { formatRace } from '@/lib/format-race'
import { getUserInfoFromToken } from '@/lib/user-info'
import { Pen } from 'lucide-react'
import { ActionDiv } from '../../components/input-like-div'
import { RaceDrawerContent } from '../../components/race-drawer-content'
import { SecondaryHeader } from '../../components/secondary-header'

export default async function PersonalInfoForm() {
  const userAuthInfo = await getUserInfoFromToken()
  let userInfo
  if (userAuthInfo.cpf) {
    try {
      const response = await getCitizenCpf(userAuthInfo.cpf, {
        cache: 'force-cache',
        next: {
          tags: [
            'update-user-email',
            'update-user-phone-number',
            'update-user-race',
          ],
        },
      })
      if (response.status === 200) {
        userInfo = response.data
      } else {
        console.error('Failed to fetch user data status:', response.data)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('pt-BR')
  }

  return (
    <>
      <div className="min-h-screen max-w-md mx-auto pt-24 pb-10 bg-background">
        <SecondaryHeader title="Informações pessoais" />
        <div className="space-y-6 p-4">
          <CustomInput
            id="cpf"
            label="CPF"
            defaultValue={formatCpf(userInfo?.cpf)}
            readOnly
          />

          <CustomInput
            id="fullName"
            label="Nome completo"
            defaultValue={userInfo?.nome || ''}
            readOnly
          />

          <CustomInput
            id="socialName"
            label="Nome social"
            tooltip="Nome pelo qual a pessoa prefere ser chamada socialmente"
            defaultValue={userInfo?.nome_social || ''}
            readOnly
          />

          <CustomInput
            id="nationality"
            label="Nacionalidade"
            defaultValue={userInfo?.nascimento?.pais || ''}
            readOnly
          />
          <ActionDiv
            label="Cor / Raça"
            content={formatRace(userInfo?.raca) || ''}
            variant="default"
            disabled
            rightIcon={<Pen />}
            drawerTitle="Cor / Raça"
            drawerContent={<RaceDrawerContent currentRace={userInfo?.raca} />}
          />

          <CustomInput
            id="birthDate"
            label="Data de nascimento"
            defaultValue={formatDate(userInfo?.nascimento?.data)}
            readOnly
          />

          <CustomInput
            id="sexo"
            label="Sexo"
            defaultValue={userInfo?.sexo || ''}
            readOnly
          />

          <ActionDiv
            label="Celular"
            content={formatPhone(
              userInfo?.telefone?.principal?.ddi,
              userInfo?.telefone?.principal?.ddd,
              userInfo?.telefone?.principal?.valor
            )}
            variant="default"
            disabled
            rightIcon={<Pen />}
            redirectLink="/user-profile/user-personal-info/user-phone-number"
          />

          <ActionDiv
            label="E-mail"
            content={userInfo?.email?.principal?.valor || ''}
            variant="default"
            disabled
            rightIcon={<Pen />}
            redirectLink="/user-profile/user-personal-info/user-email"
          />
        </div>
      </div>
    </>
  )
}
