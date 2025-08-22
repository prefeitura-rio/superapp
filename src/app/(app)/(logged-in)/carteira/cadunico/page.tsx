import { SecondaryHeader } from '@/app/components/secondary-header'
import { SocialAssistanceCard } from '@/app/components/wallet-cards/social-assistance-card'
import { CalendarIcon } from '@/assets/icons'
import { formatRecadastramentoDate } from '@/lib/cadunico-utils'
import { getDalCitizenCpfWallet } from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'

export default async function SocialAssistanceCardDetail() {
  const userAuthInfo = await getUserInfoFromToken()
  let walletData

  if (userAuthInfo.cpf) {
    try {
      const walletResponse = await getDalCitizenCpfWallet(userAuthInfo.cpf)
      if (walletResponse.status === 200) {
        walletData = walletResponse.data
      } else {
        console.error(
          'Failed to fetch wallet data status:',
          walletResponse.data
        )
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error)
    }
  }

  const socialAssistanceData = walletData?.assistencia_social
  const cras = socialAssistanceData?.cras
  const cadunico = socialAssistanceData?.cadunico

  return (
    <div className="min-h-lvh max-w-xl mx-auto pt-26 pb-10">
      <SecondaryHeader title="Carteira" className="max-w-xl" />
      <div className="z-50">
        <div className="px-4">
          <SocialAssistanceCard
            title="CADÚNICO"
            number={cras?.nome || 'Não disponível'}
            primaryLabel="Data de recadastramento"
            primaryValue={formatRecadastramentoDate(
              cadunico?.data_limite_cadastro_atual
            )}
            unitName={walletData?.assistencia_social?.cras?.nome}
            address={cras?.endereco}
            phone={cras?.telefone}
            showInitialShine
          />
        </div>
        {/* Icons Buttons Row */}
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex flex-row pl-5 gap-5 justify-start mt-8 min-w-max">
            {/* <a
              href={phoneUrl !== '#' ? phoneUrl : undefined}
              className={`flex flex-col items-center ${phoneUrl === '#' ? 'pointer-events-none' : ''}`}
            >
              <div className="rounded-full w-16 h-16 flex justify-center items-center bg-card hover:bg-card hover:text-black transition-colors">
                <Phone
                  className={`h-5 ${phoneUrl === '#' ? 'text-muted-foreground' : ''}`}
                />
              </div>
              <div className="flex flex-col items-center">
                <span className="mt-2 text-foreground text-sm font-normal">
                  Telefone
                </span>
                <span className="text-gray-300 text-xs font-normal">CRAS</span>
              </div>
            </a> */}

            {/* <a
              href={mapUrl !== '#' ? mapUrl : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center ${mapUrl === '#' ? 'pointer-events-none' : ''}`}
            >
              <div className="rounded-full w-16 h-16 flex justify-center items-center bg-card hover:bg-card hover:text-black transition-colors">
                <MapPin
                  className={`h-5 ${mapUrl === '#' ? 'text-muted-foreground' : ''}`}
                />
              </div>
              <div className="flex flex-col items-center">
                <span className="mt-2 text-foreground text-sm font-normal">
                  Endereço
                </span>
                <span className="text-gray-300 text-xs font-normal">CRAS</span>
              </div>
            </a> */}

            <a
              href="https://cadunico.rio/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center"
            >
              <div className="rounded-full w-16 h-16 flex justify-center items-center bg-card hover:bg-card hover:text-black transition-colors">
                <CalendarIcon className="h-6.5" />
              </div>
              <div className="flex flex-col items-center">
                <span className="mt-2 text-foreground text-sm font-normal">
                  Agendar
                </span>
                <span className="text-gray-300 text-xs font-normal">
                  atendimento
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
