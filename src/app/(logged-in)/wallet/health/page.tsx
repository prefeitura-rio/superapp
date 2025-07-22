import { SecondaryHeader } from '@/app/components/secondary-header'
import { HealthCard } from '@/app/components/wallet-cards/health-card'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getCitizenCpfWallet } from '@/http/citizen/citizen'
import { getHealthUnitInfo, getHealthUnitRisk } from '@/lib/health-unit'
import {
  formatOperatingHours,
  getCurrentOperatingStatus,
  getHealthUnitRiskStatus,
} from '@/lib/health-unit-utils'
import { getUserInfoFromToken } from '@/lib/user-info'
import { Calendar, MapPin, Phone } from 'lucide-react'

interface TeamPageProps {
  healthData?: {
    clinica_familia?: {
      nome?: string
    }
    equipe_saude_familia?: {
      nome?: string
      medicos?: Array<{ id_profissional_sus: string; nome: string }>
      enfermeiros?: Array<{ id_profissional_sus: string; nome: string }>
    }
  }
}

function TeamPage({ healthData }: TeamPageProps) {
  const medicos = healthData?.equipe_saude_familia?.medicos || []
  const enfermeiros = healthData?.equipe_saude_familia?.enfermeiros || []
  const teamName =
    healthData?.equipe_saude_familia?.nome || 'Equipe não disponível'

  return (
    <div className="p-6">
      <div className="">
        <h2 className="text-base pb-4">{teamName}</h2>

        <Card className="rounded-xl border-0 shadow-none">
          <CardContent className="px-0">
            {/* Doctors Section */}
            <div className="space-y-1 px-4">
              <h3 className="text-xs font-medium text-foreground-light">
                Médicos e médicas
              </h3>
              <div className="text-sm space-y-1 text-foreground">
                {medicos.length > 0 ? (
                  medicos.map((medico, index) => (
                    <p key={index} className="font-medium">
                      {medico.nome}
                    </p>
                  ))
                ) : (
                  <p className="font-medium text-foreground">Não disponível</p>
                )}
              </div>
            </div>

            {/* Full width separator that touches borders */}
            <Separator className="my-4" />

            <div className="space-y-1 px-4">
              <h3 className="text-xs font-medium text-foreground-light">
                Enfermeiros e Enfermeiras
              </h3>
              <div className="text-sm space-y-1 text-foreground">
                {enfermeiros.length > 0 ? (
                  enfermeiros.map((enfermeiro, index) => (
                    <p key={index} className="font-medium">
                      {enfermeiro.nome}
                    </p>
                  ))
                ) : (
                  <p className="font-medium text-foreground">Não disponível</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default async function HealthCardDetail() {
  const userAuthInfo = await getUserInfoFromToken()
  let walletData
  let healthUnitData
  let healthUnitRiskData

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

    // Get CNES from wallet data and fetch health unit information
    const cnes = walletData?.saude?.clinica_familia?.id_cnes
    if (cnes) {
      try {
        const [unitResponse, riskResponse] = await Promise.all([
          getHealthUnitInfo(cnes, {
            cache: 'force-cache',
            next: { revalidate: 3600 },
          }),
          getHealthUnitRisk(cnes),
        ])

        if (unitResponse.status === 200) {
          healthUnitData = unitResponse.data
        } else {
          console.error('Failed to fetch health unit data:', unitResponse.data)
        }

        if (riskResponse.status === 200) {
          healthUnitRiskData = riskResponse.data
        } else {
          console.error(
            'Failed to fetch health unit risk data:',
            riskResponse.data
          )
        }
      } catch (error) {
        console.error('Error fetching health unit data:', error)
      }
    }
  }

  const healthData = walletData?.saude

  // Only proceed if we have health data from wallet
  if (!healthData?.clinica_familia) {
    return (
      <div className="min-h-lvh max-w-md mx-auto pt-26 pb-10">
        <SecondaryHeader title="Carteira" />
        <div className="flex items-center justify-center py-6">
          <p className="text-muted-foreground text-center">
            Dados de saúde não disponíveis.
          </p>
        </div>
      </div>
    )
  }

  const clinicaFamilia = healthData.clinica_familia

  // Only use health unit API for operating hours and current status
  let operatingHours = 'Não informado'
  let statusValue = 'Não informado'
  let riskStatus = null

  if (healthUnitData) {
    operatingHours = formatOperatingHours(
      healthUnitData.funcionamento_dia_util,
      healthUnitData.funcionamento_sabado
    )
    statusValue = getCurrentOperatingStatus(
      healthUnitData.funcionamento_dia_util,
      healthUnitData.funcionamento_sabado
    )
  }

  if (healthUnitRiskData) {
    riskStatus = getHealthUnitRiskStatus(healthUnitRiskData)
  }

  // Use wallet data for all contact info and address
  const unitName = clinicaFamilia.nome || 'Nome não disponível'
  const address = clinicaFamilia.endereco || 'Endereço não disponível'
  const phone = clinicaFamilia.telefone
  const email = clinicaFamilia.email

  // Build dynamic links with real data
  const phoneUrl = phone ? `tel:${phone}` : '#'
  const whatsappUrl = phone ? `https://wa.me/${phone.replace(/\D/g, '')}` : '#'
  const mapUrl =
    address && address !== 'Endereço não disponível'
      ? `https://www.google.com/maps?q=${encodeURIComponent(address)}`
      : '#'

  return (
    <div className="min-h-lvh max-w-md mx-auto pt-26 pb-10">
      <SecondaryHeader title="Carteira" />
      <div className="z-50">
        <div className="px-4">
          <HealthCard
            title="CLÍNICA DA FAMÍLIA"
            name={unitName}
            primaryLabel="Status"
            primaryValue={statusValue}
            secondaryLabel="Horário de atendimento"
            secondaryValue={operatingHours}
            riskStatus={riskStatus?.risco}
            address={address}
            phone={phone}
            email={email}
            enableFlip={true}
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
                <Phone
                  className={`h-5 ${whatsappUrl === '#' ? 'text-muted-foreground' : ''}`}
                />
              </div>
              <div className="flex flex-col items-center">
                <span className="mt-2 text-foreground text-sm font-normal">
                  Whatsapp
                </span>
                <span className="text-gray-300 text-xs font-normal">
                  equipe
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
                <MapPin
                  className={`h-5 ${mapUrl === '#' ? 'text-muted-foreground' : ''}`}
                />
              </div>
              <div className="flex flex-col items-center">
                <span className="mt-2 text-foreground text-sm font-normal">
                  Endereço
                </span>
              </div>
            </a>
            <a
              href="https://web2.smsrio.org/portalPaciente/"
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
              </div>
            </a>
          </div>
        </div>
      </div>
      <TeamPage healthData={healthData as any} />
    </div>
  )
}
