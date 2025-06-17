import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { MapPin, Phone } from 'lucide-react'
import { SecondaryHeader } from '../../components/secondary-header'
import { getFrequenciaEscolarTextClass } from '../../components/utils'
import { WalletEducationCard } from '../../components/wallet-education-card'

const frequenciaEscolar = '85,32'
const conceito = 'Muito Bom'

function DesempenhoSection() {
  return (
    <div className="p-6">
      <div className="">
        <h2 className="text-base pb-4">Desempenho</h2>

        <Card className="rounded-xl border-0 shadow-none">
          <CardContent className="px-0">
            {/* Doctors Section */}
            <div className="space-y-1 px-5">
              <h3 className="text-xs font-medium text-foreground-light">
                Conceito
              </h3>
              <div className="space-y-1 text-foreground">
                <p className="text-sm font-medium">{conceito}</p>
              </div>
            </div>

            {/* Full width separator that touches borders */}
            <Separator className="my-4" />

            <div className="space-y-1 px-5">
              <h3 className="text-xs font-medium text-foreground-light">
                Frequência escolar
              </h3>
              <div className="space-y-1 text-foreground">
                <p
                  className={`text-sm font-medium ${getFrequenciaEscolarTextClass(frequenciaEscolar)}`}
                >
                  {frequenciaEscolar}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function EducationCardDetail() {
  return (
    <div className="min-h-lvh max-w-md mx-auto pt-26 pb-10">
      <SecondaryHeader title="Carteira" />
      <div className="z-50">
        <div className="px-5">
          <WalletEducationCard
            href="#"
            title="Escola"
            name="Escola Municipal Geyner EleuThério Rodrigues"
            statusLabel="Status"
            statusValue="Atualizar"
            extraLabel="Horário de atendimento"
            extraValue="7h às 18h"
            showEyeButton={true}
            showInfoButton={true}
            showStatusIcon={true}
          />
        </div>
        {/* Icons Buttons Row */}
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex flex-row pl-5 gap-5 justify-start mt-8 min-w-max">
            <a href="tel:(21)997015128" className="flex flex-col items-center">
              <div className="rounded-full w-16 h-16 flex justify-center items-center bg-card hover:bg-card hover:text-black transition-colors">
                <Phone className="h-5" />
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
              href="https://wa.me/+5521997015128"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center"
            >
              <div className="rounded-full w-16 h-16 flex justify-center items-center bg-card hover:bg-card hover:text-black transition-colors">
                <Phone className="h-5" />
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
              href="https://www.google.com/maps?q='rua lucio de mendonça 17'"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center"
            >
              <div className="rounded-full w-16 h-16 flex justify-center items-center bg-card hover:bg-card hover:text-black transition-colors">
                <MapPin className="h-5" />
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
      <DesempenhoSection />
    </div>
  )
}
