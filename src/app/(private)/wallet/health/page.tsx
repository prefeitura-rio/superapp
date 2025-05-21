import { Button } from '@/components/ui/button'

import Whatsapp from '@/assets/Whatsapp.svg'
import { Headset, MapPin, Phone } from 'lucide-react'
import Image from 'next/image'
import { SecondaryHeader } from '../../components/secondary-header'
import { WalletCard } from '../../components/wallet-card'

export default function HealthCard() {
  return (
    <div className="max-w-md mx-auto pt-26">
      <SecondaryHeader title="Carteira de Saúde" />
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
        <div className="flex flex-row gap-6 justify-center mt-8">
          {/* WhatsApp Button Example */}
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="lg"
              className="rounded-full w-16 h-16 bg-[#16181A] hover:bg-[#232326] transition-colors"
            >
              <Phone className="h-8" />
            </Button>
            <span className="mt-2 text-white text-xs font-normal">
              Telefone
            </span>
          </div>
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-16 h-16 bg-[#16181A] hover:bg-[#232326] transition-colors"
            >
              <Image src={Whatsapp} alt="Whatsapp" width={22} height={22} />
            </Button>
            <span className="mt-2 text-white text-xs font-normal">
              Whatsapp
            </span>
          </div>
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="lg"
              className="rounded-full w-16 h-16 bg-[#16181A] hover:bg-[#232326] transition-colors"
            >
              <MapPin className="h-8" />
            </Button>
            <span className="mt-2 text-white text-xs font-normal">
              Endereço
            </span>
          </div>
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="lg"
              className="rounded-full w-16 h-16 bg-[#16181A] hover:bg-[#232326] transition-colors"
            >
              <Headset className="h-8" />
            </Button>
            <span className="mt-2 text-white text-xs font-normal">
              Atendimento
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
