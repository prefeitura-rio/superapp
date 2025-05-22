import { Button } from '@/components/ui/button'

import Whatsapp from '@/assets/Whatsapp.svg'
import { Card } from '@/components/ui/card'
import { Headset, MapPin, Phone } from 'lucide-react'
import Image from 'next/image'
import { SecondaryHeader } from '../../components/secondary-header'
import { WalletCard } from '../../components/wallet-card'

function TeamMemberCard({
  name,
  staffRole,
}: { name: string; staffRole: string }) {
  return (
    <Card className="bg-zinc-900 border-none rounded-xl p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-medium">{name}</h2>
        <span className="text-xs">{staffRole}</span>
      </div>
    </Card>
  )
}

function TeamPage() {
  return (
    <div className="text-white p-6">
      <div className="">
        <h2 className="pb-4">Equipe Monero</h2>

        <div className="space-y-4">
          <TeamMemberCard name="Isabella Ribeiro Costa" staffRole="Médica" />
          <TeamMemberCard name="Bruno Henrique Oliveira" staffRole="Médico" />
          <TeamMemberCard
            name="Larissa Mendes Carvalho"
            staffRole="Enfermeira"
          />
          <TeamMemberCard name="João Pedro Santana" staffRole="Enfermeiro" />
          <TeamMemberCard name="Thiago Moreira Pires" staffRole="Enfermeiro" />
        </div>
      </div>
    </div>
  )
}

export default function HealthCard() {
  return (
    <div className="max-w-md mx-auto pt-26 pb-10">
      <SecondaryHeader title="Carteira" />
      <div className="px-5 z-50">
        <h2 className="pb-4">Saúde</h2>
        <WalletCard
          href="#"
          title="Clínica da Família"
          name="Maria Sebastiana de Oliveira"
          statusLabel="Situação"
          statusValue="Normal"
          extraLabel="Horário de atendimento"
          extraValue="7h às 18h"
          bgClass="bg-blue-100"
        />
        {/* WhatsApp Icon Buttons Row */}
        <div className="flex flex-row gap-5 justify-center mt-8">
          {/* WhatsApp Button */}
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="lg"
              className="rounded-full w-16 h-16 bg-[#16181A] hover:bg-[#232326] transition-colors"
            >
              <Phone className="h-8" />
            </Button>
            <div className="flex flex-col items-center">
              <span className="mt-2 text-white text-sm font-normal">
                Telefone
              </span>
              <span className=" text-gray-300 text-xs font-normal">
                unidade
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-16 h-16 bg-[#16181A] hover:bg-[#232326] transition-colors"
            >
              <Image src={Whatsapp} alt="Whatsapp" width={22} height={22} />
            </Button>
            <div className="flex flex-col items-center">
              <span className="mt-2 text-white text-sm font-normal">
                Whatsapp
              </span>
              <span className=" text-gray-300 text-xs font-normal">equipe</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="lg"
              className="rounded-full w-16 h-16 bg-[#16181A] hover:bg-[#232326] transition-colors"
            >
              <MapPin className="h-8" />
            </Button>
            <div className="flex flex-col items-center">
              <span className="mt-2 text-white text-sm font-normal">
                Endereço
              </span>
              {/* <span className=" text-gray-300 text-xs font-normal">
                unidade
              </span> */}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="lg"
              className="rounded-full w-16 h-16 bg-[#16181A] hover:bg-[#232326] transition-colors"
            >
              <Headset className="h-8" />
            </Button>
            <div className="flex flex-col items-center">
              <span className="mt-2 text-white text-sm font-normal">
                Atendimento
              </span>
              {/* <span className=" text-gray-300 text-xs font-normal">
                central
              </span> */}
            </div>
          </div>
        </div>
      </div>
      <TeamPage />
    </div>
  )
}
