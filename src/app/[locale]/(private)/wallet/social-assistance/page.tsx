import { Calendar } from 'lucide-react'
import { SecondaryHeader } from '../../components/secondary-header'
import { WalletSocialAssistanceCard } from '../../components/wallet-social-assistance-card'

export default function SocialAssistanceCardDetail() {
  return (
    <div className="min-h-lvh max-w-md mx-auto pt-26 pb-10">
      <SecondaryHeader title="Carteira" />
      <div className="z-50">
        <div className="px-5">
          <WalletSocialAssistanceCard
            href="#"
            title="CADÚNICO"
            name="CRAS Elis Regina"
            statusLabel="Status"
            statusValue="Atualizar"
            extraLabel="Data de recadastramento"
            extraValue="18.12.2025"
            showEyeButton={true}
          />
        </div>
        {/* Icons Buttons Row */}
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex flex-row pl-5 gap-5 justify-start mt-8 min-w-max">
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
              </div>
              <span className="text-gray-300 text-xs font-normal">
                atendimento
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
