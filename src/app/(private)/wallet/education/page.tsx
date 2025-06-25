import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { PageFadeInWrapper } from '@/components/ui/page-fade-in'
import { Separator } from '@/components/ui/separator'
import { InfoIcon, MapPin, Phone } from 'lucide-react'
import { SecondaryHeader } from '../../components/secondary-header'
import { getFrequenciaEscolarTextClass } from '../../components/utils'
import { WalletEducationCard } from '../../components/wallet-education-card'

const frequenciaEscolar = '85,32'
const conceito = 'Muito Bom'

function DesempenhoSection() {
  return (
    <PageFadeInWrapper>
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
                <div className="flex items-center gap-1">
                  <h3 className="text-xs font-medium text-foreground-light">
                    Frequência escolar
                  </h3>
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Frequência Escolar Info"
                        className="hover:bg-transparent hover:cursor-pointer h-4 w-4 p-0"
                      >
                        <InfoIcon className="h-3 w-3 text-foreground-light" />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent className="p-8 max-w-md mx-auto !rounded-t-3xl">
                      <div className="flex justify-center pt-0 pb-1">
                        <div className="w-8.5 h-1 -mt-2 rounded-full bg-popover-line" />
                      </div>
                      <DrawerHeader className="sr-only">
                        <DrawerTitle>Frequência Escolar</DrawerTitle>
                      </DrawerHeader>
                      <div className="text-sm text-popover-foreground">
                        <p className="mt-3">
                        Frequência escolar do aluno no último trimestre letivo.
                        </p>
                      </div>
                    </DrawerContent>
                  </Drawer>
                </div>
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
    </PageFadeInWrapper>
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
            title="ESCOLA"
            name="Escola Municipal Geyner EleuThério Rodrigues"
            statusLabel="Status"
            statusValue="Atualizar"
            extraLabel="Horário de Atendimento"
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
