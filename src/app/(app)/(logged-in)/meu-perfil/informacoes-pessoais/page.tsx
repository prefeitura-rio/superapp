import { ActionDiv } from '@/app/components/action-div'
import { RaceDrawerContent } from '@/app/components/drawer-contents/race-drawer-content'
import { SocialNameDrawerContent } from '@/app/components/drawer-contents/social-name-drawer-content'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { EditIcon } from '@/assets/icons/edit-icon'
import { CustomInput } from '@/components/ui/custom/custom-input'
import { getDalCitizenCpf } from '@/lib/dal'
import { formatCpf } from '@/lib/format-cpf'
import { formatPhone } from '@/lib/format-phone'
import { formatRace } from '@/lib/format-race'
import { getUserInfoFromToken } from '@/lib/user-info'
import { formatTitleCase, shouldShowUpdateBadge } from '@/lib/utils'

export default async function PersonalInfoForm() {
  const userAuthInfo = await getUserInfoFromToken()
  let userInfo
  if (userAuthInfo.cpf) {
    try {
      const response = await getDalCitizenCpf(userAuthInfo.cpf)
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

  const showPhoneBadge = userInfo?.telefone?.principal
    ? shouldShowUpdateBadge(userInfo.telefone.principal.updated_at) ||
      !userInfo?.telefone?.principal?.ddi ||
      !userInfo?.telefone?.principal?.ddd ||
      !userInfo?.telefone?.principal?.valor
    : true // Show badge when phone info is missing
  const showEmailBadge = userInfo?.email?.principal
    ? shouldShowUpdateBadge(userInfo.email.principal.updated_at)
    : true // Show badge when email info is missing
  const showRaceBadge = !userInfo?.raca // Show badge when race info is missing

  return (
    <>
      <div className="min-h-screen max-w-4xl mx-auto pt-24 pb-10 bg-background">
        <SecondaryHeader title="Informações pessoais" route="/meu-perfil" />
        <div className="space-y-6 p-4">
          <CustomInput
            id="fullName"
            label="Nome completo"
            defaultValue={
              formatTitleCase(userAuthInfo?.name) || 'Informação indisponível'
            }
            isEditable={false}
          />

          {userInfo?.nome_social && (
            <ActionDiv
              label="Nome social"
              tooltip="Nome pelo qual a pessoa prefere ser chamada socialmente"
              content={userInfo?.nome_social || 'Informação indisponível'}
              drawerContent={<SocialNameDrawerContent />}
              drawerTitle="Nome social"
            />
          )}

          <ActionDiv
            label="Nome de exibição"
            content={userInfo?.nome_exibicao ? userInfo.nome_exibicao : ''}
            variant="default"
            disabled
            rightIcon={<EditIcon />}
            redirectLink="/meu-perfil/informacoes-pessoais/atualizar-nome-exibicao"
          />

          <ActionDiv
            label="Celular"
            optionalLabelVariant={showPhoneBadge ? 'destructive' : undefined}
            optionalLabel={showPhoneBadge ? 'Atualizar' : undefined}
            content={
              userInfo?.telefone?.principal?.ddi &&
              userInfo?.telefone?.principal?.ddd &&
              userInfo?.telefone?.principal?.valor
                ? formatPhone(
                    userInfo.telefone.principal.ddi,
                    userInfo.telefone.principal.ddd,
                    userInfo.telefone.principal.valor
                  )
                : userInfo?.telefone?.principal
                  ? 'Faltando informação'
                  : 'Informação indisponível'
            }
            variant="default"
            disabled
            rightIcon={<EditIcon />}
            redirectLink="/meu-perfil/informacoes-pessoais/atualizar-telefone"
          />

          <ActionDiv
            label="E-mail"
            optionalLabelVariant={showEmailBadge ? 'destructive' : undefined}
            optionalLabel={showEmailBadge ? 'Atualizar' : undefined}
            content={
              userInfo?.email?.principal
                ? userInfo.email.principal.valor
                : 'Informação indisponível'
            }
            variant="default"
            disabled
            rightIcon={<EditIcon />}
            redirectLink="/meu-perfil/informacoes-pessoais/atualizar-email"
          />

          <CustomInput
            id="cpf"
            label="CPF"
            defaultValue={formatCpf(userAuthInfo?.cpf)}
            isEditable={false}
          />

          <CustomInput
            id="nationality"
            label="Nacionalidade"
            defaultValue={
              userInfo?.nascimento?.pais || 'Informação indisponível'
            }
            isEditable={false}
          />

          <ActionDiv
            label="Cor / Raça"
            optionalLabelVariant={showRaceBadge ? 'destructive' : undefined}
            optionalLabel={showRaceBadge ? 'Atualizar' : undefined}
            content={formatRace(userInfo?.raca) || 'Informação indisponível'}
            variant="default"
            disabled
            rightIcon={<EditIcon />}
            drawerContent={<RaceDrawerContent currentRace={userInfo?.raca} />}
            drawerTitle="Cor / Raça"
          />

          <CustomInput
            id="birthDate"
            label="Data de nascimento"
            defaultValue={
              formatDate(userInfo?.nascimento?.data) ||
              'Informação indisponível'
            }
            isEditable={false}
          />

          <CustomInput
            id="sexo"
            label="Sexo"
            defaultValue={
              userInfo?.sexo
                ? formatTitleCase(userInfo.sexo)
                : 'Informação indisponível'
            }
            isEditable={false}
          />
        </div>
      </div>
    </>
  )
}
