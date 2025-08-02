import { FrequencyInfoButton } from '@/app/components/frequency-info-button'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  formatEducationOperatingHours,
  getOperatingStatus,
} from '@/lib/operating-status'
import { getUserInfoFromToken } from '@/lib/user-info'

import { getFrequenciaEscolarTextClass } from '@/app/components/utils'
import { EducationCard } from '@/app/components/wallet-cards/education-card'
import { MapPinIcon, PhoneIcon, WhatsappIcon } from '@/assets/icons'
import { getDalCitizenCpfWallet } from '@/lib/dal'

interface DesempenhoSectionProps {
  educationData?: {
    aluno?: {
      conceito?: string
      frequencia?: number
    }
  }
}

function DesempenhoSection({ educationData }: DesempenhoSectionProps) {
  const conceito = educationData?.aluno?.conceito || 'Não disponível'
  const frequencia = educationData?.aluno?.frequencia
    ? (educationData.aluno.frequencia * 100).toFixed(2)
    : null

  // Capitalize first letter of conceito
  const conceitoCapitalized =
    conceito.charAt(0).toUpperCase() + conceito.slice(1).toLowerCase()

  return (
    <div className="p-6">
      <div className="">
        <h2 className="text-base pb-2 text-foreground font-medium leading-">
          Desempenho
        </h2>

        <Card className="rounded-xl border-0 shadow-none">
          <CardContent className="px-0">
            {/* Conceito Section */}
            <div className="space-y-1 px-4">
              <h3 className="text-xs font-medium text-foreground-light">
                Conceito
              </h3>
              <div className="space-y-1 text-foreground">
                <p className="text-sm font-medium">{conceitoCapitalized}</p>
              </div>
            </div>

            {/* Full width separator that touches borders */}
            <Separator className="my-4" />

            <div className="space-y-1 px-4">
              <div className="flex items-center gap-1">
                <h3 className="text-xs font-medium text-foreground-light">
                  Frequência escolar
                </h3>
                <FrequencyInfoButton />
              </div>
              <div className="space-y-1 text-foreground">
                <p
                  className={`text-sm font-medium ${frequencia ? getFrequenciaEscolarTextClass(frequencia) : ''}`}
                >
                  {frequencia ? `${frequencia}%` : 'Não informado'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

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
      <DesempenhoSection educationData={educationData} />
    </div>
  )
}
