import { SecondaryHeader } from '@/app/components/secondary-header'
import { MailIcon, PhoneIcon } from '@/assets/icons'
import { MenuItem } from '@/components/ui/custom/menu-item'
import {
  type EmailData,
  getEmailValue,
  hasValidEmail,
} from '@/helpers/email-data-helpers'
import {
  type PhoneData,
  getPhoneValue,
  hasValidPhone,
} from '@/helpers/phone-data-helpers'
import { getDalCitizenCpf } from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'

interface PageProps {
  searchParams: Promise<{ redirectFromCourses?: string }>
}

type UserInfoProps = {
  cpf?: string
  name?: string
  email?: EmailData
  telefone?: PhoneData
}

export default async function AtualizarDadosPage({ searchParams }: PageProps) {
  const params = await searchParams
  const courseSlug = params.redirectFromCourses

  const userAuthInfo = await getUserInfoFromToken()
  let userInfoObj = userAuthInfo as UserInfoProps
  let dataCitizen = null

  if (userAuthInfo.cpf) {
    dataCitizen = await getDalCitizenCpf(userAuthInfo.cpf)
  }

  if (dataCitizen && dataCitizen.status === 200) {
    userInfoObj = {
      ...userAuthInfo,
      ...dataCitizen.data,
      email: dataCitizen.data?.email || { principal: { valor: '' } },
      telefone: dataCitizen.data?.telefone || {
        principal: { ddi: '', ddd: '', valor: '' },
      },
    }
  }

  const phoneDisplay = hasValidPhone(userInfoObj?.telefone)
    ? getPhoneValue(userInfoObj.telefone)
    : 'Informação pendente'

  const emailDisplay = hasValidEmail(userInfoObj?.email)
    ? getEmailValue(userInfoObj.email)
    : 'Informação pendente'

  return (
    <div className="pt-20 min-h-lvh max-w-xl mx-auto text-foreground flex flex-col">
      <SecondaryHeader
        title=""
        route={
          courseSlug
            ? `/servicos/cursos/confirmar-informacoes/${courseSlug}`
            : '/servicos/cursos/'
        }
      />

      <div className="px-4">
        <h1 className="text-3xl font-medium text-foreground pt-2 pb-6 leading-9 tracking-tight">
          O que você gostaria de atualizar?
        </h1>

        <div className="space-y-0">
          <MenuItem
            icon={<PhoneIcon className="h-5 w-5" />}
            title="Celular"
            label={phoneDisplay as string}
            href={`/meu-perfil/informacoes-pessoais/atualizar-telefone${
              courseSlug ? `?redirectFromCourses=${courseSlug}` : ''
            }`}
          />

          <MenuItem
            icon={<MailIcon className="h-5 w-5" />}
            title="E-mail"
            label={emailDisplay as string}
            href={`/meu-perfil/informacoes-pessoais/atualizar-email${
              courseSlug ? `?redirectFromCourses=${courseSlug}` : ''
            }`}
          />
        </div>

        <p className="font-sm text-muted-foreground font-normal leading-5 tracking-normal pt-8">
          As demais informações são obtidas a partir dos dados fornecidos pela
          plataforma Gov.br
        </p>
      </div>
    </div>
  )
}
