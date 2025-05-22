import bolsaFamilia from '@/assets/bolsaFamilia.svg'
import { Button } from '@/components/ui/button'

import { Plus } from 'lucide-react'
import { SecondaryHeader } from '../../components/secondary-header'
import { WalletCard } from '../../components/wallet-card'

export default function HealthCard() {
  return (
    <div className="min-h-dvh max-w-md mx-auto pt-26 pb-10">
      <SecondaryHeader title="Carteira" />
      <div className="px-5 z-50">
        <h2 className="pb-4">Bolsa Família</h2>
        <WalletCard
          href="/wallet/social-benefits"
          title="Bolsa Família"
          name="6352 7758 4323"
          statusLabel="Status"
          statusValue="Atualizar cadastro"
          extraLabel="Data de recadastramento"
          extraValue="17.06.2025"
          bgClass="bg-yellow-100"
          icon={{ src: bolsaFamilia, alt: 'Bolsa Família' }}
          gapClass="gap-2.5 sm:gap-8"
        />

        {/* WhatsApp Icon Buttons Row */}
        <div className="flex flex-row gap-5 justify-start mt-8">
          {/* WhatsApp Button */}
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="lg"
              className="rounded-full w-16 h-16 bg-[#16181A] hover:bg-[#232326] transition-colors"
            >
              <Plus className="h-8" />
            </Button>
            <div className="flex flex-col items-center">
              <span className="mt-2 text-white text-sm font-normal">
                Atualizar
              </span>
              <span className=" text-gray-300 text-xs font-normal">
                cadastro
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
