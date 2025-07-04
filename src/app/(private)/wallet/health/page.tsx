import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getCitizenCpfWallet } from '@/http/citizen/citizen'
import { getOperatingStatus } from '@/lib/clinic-operating-status'
import { getUserInfoFromToken } from '@/lib/user-info'
import { Calendar, MapPin, Phone } from 'lucide-react'
import { SecondaryHeader } from '../../components/secondary-header'
import { WalletHealthCard } from '../../components/wallet-health-card'

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
            <div className="space-y-1 px-5">
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

            <div className="space-y-1 px-5">
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

  const healthData = walletData?.saude
  const clinica = healthData?.clinica_familia

  // Build dynamic links with real data
  const phoneUrl = clinica?.telefone ? `tel:${clinica.telefone}` : '#'
  const mapUrl = clinica?.endereco
    ? `https://www.google.com/maps?q=${encodeURIComponent(clinica.endereco)}`
    : '#'

  return (
    <div className="min-h-lvh max-w-md mx-auto pt-26 pb-10">
      <SecondaryHeader title="Carteira" />
      <div className="z-50">
        <div className="px-5">
          <WalletHealthCard
            href="#"
            title="CLÍNICA DA FAMÍLIA"
            name={clinica?.nome || 'Não disponível'}
            statusLabel="Situação"
            statusValue={getOperatingStatus(clinica?.horario_atendimento)}
            extraLabel="Horário de atendimento"
            extraValue={clinica?.horario_atendimento || 'Não informado'}
            address={clinica?.endereco}
            phone={clinica?.telefone}
            email={clinica?.email}
            bgClass="bg-blue-100"
            color="verde"
            showEyeButton={true}
            showInfoButton={true}
            showStatusIcon={true}
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
              href={
                clinica?.telefone
                  ? `https://wa.me/${clinica.telefone.replace(/\D/g, '')}`
                  : undefined
              }
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center ${!clinica?.telefone ? 'pointer-events-none' : ''}`}
            >
              <div className="rounded-full w-16 h-16 flex justify-center items-center bg-card hover:bg-card hover:text-black transition-colors">
                <Phone
                  className={`h-5 ${!clinica?.telefone ? 'text-muted-foreground' : ''}`}
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
