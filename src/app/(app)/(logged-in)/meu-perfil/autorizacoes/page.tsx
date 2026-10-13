import { OptInSwitch } from '@/app/components/opt-in-switch'
import { ProfileHeaderWrapper } from '@/app/components/profile-header-wrapper'
import { getCitizenCpfOptin } from '@/http/citizen/citizen'
import { getUserInfoFromToken } from '@/lib/user-info'

export default async function ConsentForm() {
  const user = await getUserInfoFromToken()
  let authorized = false

  if (user.cpf) {
    try {
      const response = await getCitizenCpfOptin(user.cpf, {
        cache: 'no-store',
        next: {
          tags: ['user-authorizations'],
        },
      })
      if (response.status === 200) {
        authorized = response.data.opt_in ?? false
      }
    } catch (error) {
      console.error('Error fetching opt-in status:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col space-y-6">
      <ProfileHeaderWrapper title="Autorizações" menuHref="/meu-perfil" />
      <div className="mx-4 flex flex-col gap-2">
        <h2 className="text-3xl font-medium text-foreground tracking-tight leading-9">
          Você autoriza receber comunicações diretas pelos canais da Prefeitura
          do Rio?
        </h2>
        <div className="text-foreground-light text-sm leading-5">
          <p>
            Ao ativar as comunicações da Prefeitura do Rio via WhatsApp, você
            passará a receber informações relevantes e personalizadas sobre
            benefícios, serviços públicos, oportunidades e ações da Prefeitura,
            com base no seu perfil.
          </p>
          <p>
            Mensagens de caráter urgente ou emergencial poderão ser enviadas
            independentemente das preferências selecionadas.
          </p>
        </div>
      </div>
      <OptInSwitch authorized={authorized} />
    </div>
  )
}
