import { SecondaryHeader } from '@/app/components/secondary-header'
import { MailIcon, PhoneIcon } from '@/assets/icons'
import { MenuItem } from '@/components/ui/custom/menu-item'
import type { ModelsTelefone } from '@/http/models'
import { getDalCitizenCpf } from '@/lib/dal'
import { formatUserPhone } from '@/lib/format-phone'
import { getUserInfoFromToken } from '@/lib/user-info'

interface PageProps {
  searchParams: Promise<{ redirectFromCourses?: string }>
}

type UserInfoProps = {
  cpf?: string
  name?: string
  email?: { principal?: { valor: string } }
  telefone?: ModelsTelefone
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
      email: {
        principal: {
          valor: dataCitizen.data?.email?.principal?.valor || '',
        },
      },
    }
  }

  const formatedUserPhone =
    userInfoObj && 'telefone' in userInfoObj
      ? formatUserPhone(userInfoObj.telefone as ModelsTelefone | undefined)
      : 'Informação indisponível'

  return (
    <div className="pt-20 min-h-lvh max-w-4xl mx-auto text-foreground flex flex-col">
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
            label={String(formatedUserPhone) || 'Informação indisponível'}
            href={`/meu-perfil/informacoes-pessoais/atualizar-telefone${
              courseSlug ? `?redirectFromCourses=${courseSlug}` : ''
            }`}
          />

          <MenuItem
            icon={<MailIcon className="h-5 w-5" />}
            title="E-mail"
            label={
              userInfoObj?.email?.principal?.valor
                ? userInfoObj.email.principal.valor
                : 'Informação indisponível'
            }
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
