import { getCitizenCpfWallet } from '@/http/citizen/citizen'
import { getUserInfoFromToken } from '@/lib/user-info'
import { Calendar, MapPin, Phone } from 'lucide-react'
import {
  formatRecadastramentoDate,
  getCadUnicoStatus,
} from '../../../../lib/cadunico-utils'
import { SecondaryHeader } from '../../components/secondary-header'
import { SocialAssistanceCard } from '../../components/wallet-cards/social-assistance-card'

export default async function SocialAssistanceCardDetail() {
  const userAuthInfo = await getUserInfoFromToken()
  let walletData

  if (userAuthInfo.cpf) {
    try {
      const walletResponse = await getCitizenCpfWallet(userAuthInfo.cpf, {
        cache: 'force-cache',
      })
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

  // Build dynamic links with real data
  const phoneUrl = cras?.telefone ? `tel:${cras.telefone}` : '#'
  const mapUrl = cras?.endereco
    ? `https://www.google.com/maps?q=${encodeURIComponent(cras.endereco)}`
    : '#'

  return (
    <div className="min-h-lvh max-w-md mx-auto pt-26 pb-10">
      <SecondaryHeader title="Carteira" />
      <div className="z-50">
        <div className="px-4">
          <SocialAssistanceCard
            title="CADÚNICO"
            number={cras?.nome || 'Não disponível'}
            badgeStatus={getCadUnicoStatus(cadunico)}
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
            <a
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
            </a>

            <a
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
            </a>

            <a
              href="https://cadunico.rio/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center"
            >
              <div className="rounded-full w-16 h-16 flex justify-center items-center bg-card hover:bg-card hover:text-black transition-colors">
                <Calendar className="h-5" />
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
