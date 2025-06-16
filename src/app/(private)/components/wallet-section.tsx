import bolsaFamilia from '@/assets/bolsaFamilia.svg'
import icon1746 from '@/assets/icon1746.svg'
import Link from 'next/link'
import { WalletCard } from './wallet-card'
import { WalletHealthCard } from './wallet-health-card'

export default function CarteiraSection() {
  return (
    <section className="px-5 mt-6 pb-30">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-md font-medium text-foreground">Carteira</h2>
        <Link
          href="/wallet"
          className="text-md text-[#A2A2A2] cursor-pointer font-medium"
        >
          ver tudo
        </Link>
      </div>

      <div className="flex flex-col gap-4 w-full">
        <WalletHealthCard
          href="/wallet/health"
          title="Clínica da Família"
          name="Maria Sebastiana"
          statusLabel="Situação"
          statusValue="Aberto"
          extraLabel="Horário de atendimento"
          extraValue="7h às 18h"
          bgClass="bg-blue-100"
        />

        {/* Card 2: Bolsa Família */}
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

        {/* Card 3: Zeladoria */}
        <WalletCard
          href="/wallet/calls"
          title="Zeladoria"
          statusLabel="Chamados"
          statusValue="29"
          extraLabel="Abertos"
          extraValue="3"
          bgClass="bg-green-100"
          icon={{ src: icon1746, alt: 'Zeladoria' }}
        />
      </div>
    </section>
  )
}
