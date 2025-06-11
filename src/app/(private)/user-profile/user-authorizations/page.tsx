import { getCitizenCpfOptin } from '@/http/citizen/citizen'
import { getUserInfoFromToken } from '@/lib/user-info'
import { OptInSwitch } from '../../components/opt-in-switch'
import { SecondaryHeader } from '../../components/secondary-header'

export default async function ConsentForm() {
  const user = await getUserInfoFromToken()
  let authorized = false

  if (user.cpf) {
    try {
      const response = await getCitizenCpfOptin(user.cpf, { cache: 'no-store' })
      if (response.status === 200) {
        authorized = response.data.optin ?? false
      }
    } catch (error) {
      console.error('Error fetching opt-in status:', error)
    }
  }

  return (
    <div className="max-w-md mx-auto pt-24 flex flex-col space-y-6">
      <SecondaryHeader title="Autorizações" />
      <div className="space-y-4 mx-4 ">
        <h1 className="text-xl font-medium text-primary">
          Você autoriza receber comunicações diretas pelos canais da Prefeitura
          do Rio?
        </h1>
        <p className="text-foreground text-sm leading-relaxed">
          Ao ativar as comunicações da Prefeitura do Rio via WhatsApp, você
          passará a receber informações relevantes e personalizadas sobre
          benefícios, serviços públicos, oportunidades e ações da Prefeitura,
          com base no seu perfil.
        </p>
        <p className="text-foreground text-sm leading-relaxed">
          Mensagens de caráter urgente ou emergencial poderão ser enviadas
          independentemente das preferências selecionadas.
        </p>
      </div>
      <OptInSwitch authorized={authorized} />
    </div>
  )
}
