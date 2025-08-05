import { SecondaryHeader } from '@/app/components/secondary-header'
import {
  formatEducationOperatingHours,
  getOperatingStatus,
} from '@/lib/operating-status'
import { getUserInfoFromToken } from '@/lib/user-info'

import { EducationCard } from '@/app/components/wallet-cards/education-card'
import { MapPinIcon, PhoneIcon, WhatsappIcon } from '@/assets/icons'
import { getDalCitizenCpfWallet } from '@/lib/dal'

export default async function EducationCardDetail() {
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

  const educationData = walletData?.educacao
  const escola = educationData?.escola

  // Build dynamic links with real data
  const phoneUrl = escola?.telefone ? `tel:${escola.telefone}` : '#'
  const whatsappUrl = escola?.whatsapp
    ? `https://wa.me/${escola.whatsapp.replace(/\D/g, '')}`
    : '#'
  const mapUrl = escola?.endereco
    ? `https://www.google.com/maps?q=${encodeURIComponent(escola.endereco)}`
    : '#'

  return (
    <div className="min-h-lvh max-w-xl mx-auto pt-26 pb-10">
      <SecondaryHeader title="Carteira" />
      <div className="z-50">
        <div className="px-4">
          <EducationCard
            title="ESCOLA DE JOVENS E ADULTOS"
            name={escola?.nome || 'Não disponível'}
            primaryLabel="Status"
            primaryValue={
              escola?.horario_funcionamento
                ? getOperatingStatus(escola.horario_funcionamento)
                : 'Não informado'
            }
            secondaryLabel="Horário de Atendimento"
            secondaryValue={formatEducationOperatingHours(
              escola?.horario_funcionamento
            )}
            address={escola?.endereco || 'Endereço não disponível'}
            phone={escola?.telefone}
            email={escola?.email}
            enableFlip
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
                <PhoneIcon
                  className={`h-6.5 ${phoneUrl === '#' ? 'text-muted-foreground' : ''}`}
                />
              </div>
              <div className="flex flex-col items-center">
                <span className="mt-2 text-foreground text-sm font-normal">
                  Telefone
                </span>
                <span className=" text-gray-300 text-xs font-normal">
                  unidade
                </span>
              </div>
            </a>
            <a
              href={whatsappUrl !== '#' ? whatsappUrl : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center ${whatsappUrl === '#' ? 'pointer-events-none' : ''}`}
            >
              <div className="rounded-full w-16 h-16 flex justify-center items-center bg-card hover:bg-card hover:text-black transition-colors">
                <WhatsappIcon
                  className={`h-6.5 ${whatsappUrl === '#' ? 'text-muted-foreground' : ''}`}
                />
              </div>
              <div className="flex flex-col items-center">
                <span className="mt-2 text-foreground text-sm font-normal">
                  Whatsapp
                </span>
                <span className="text-gray-300 text-xs font-normal">
                  escola
                </span>
              </div>
            </a>
            <a
              href={mapUrl !== '#' ? mapUrl : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center ${mapUrl === '#' ? 'pointer-events-none' : ''}`}
            >
              <div className="rounded-full w-16 h-16 flex justify-center items-center bg-card hover:bg-card hover:text-black transition-colors">
                <MapPinIcon
                  className={`h-6.5 ${mapUrl === '#' ? 'text-muted-foreground' : ''}`}
                />
              </div>
              <div className="flex flex-col items-center">
                <span className="mt-2 text-foreground text-sm font-normal">
                  Endereço
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
