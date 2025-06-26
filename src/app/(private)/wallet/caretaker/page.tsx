import { Globe, Phone } from 'lucide-react'
import Calls from '../../components/calls'
import { SecondaryHeader } from '../../components/secondary-header'
import { WalletCaretakerCard } from '../../components/wallet-caretaker-card'

export default function CaretakerCardDetail() {
  return (
    <div className="min-h-lvh max-w-md mx-auto pt-26 pb-10">
      <SecondaryHeader title="Carteira" />
      <div className="z-50">
        <div className="px-5">
          <WalletCaretakerCard
            href="/wallet/caretaker"
            title="CUIDADOS COM A CIDADE"
            name="3 chamados em aberto"
            statusLabel="Total de chamados"
            statusValue="27"
            extraLabel="Fechados"
            extraValue="24"
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
                  Chamado
                </span>
                <span className=" text-gray-300 text-xs font-normal">
                  whatsapp
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
                <Globe className="h-5" />
              </div>
              <div className="flex flex-col items-center">
                <span className="mt-2 text-foreground text-sm font-normal">
                  Chamado
                </span>
                <span className="text-gray-300 text-xs font-normal">
                  website
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>
      <Calls />
    </div>
  )
}
