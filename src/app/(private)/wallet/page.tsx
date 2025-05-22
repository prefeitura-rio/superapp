import bolsaFamilia from '@/assets/bolsaFamilia.svg'
import icon1746 from '@/assets/icon1746.svg'
import { FloatNavigation } from '../components/float-navation'
import MainHeader from '../components/main-header'
import { WalletCard } from '../components/wallet-card'

export default function Wallet() {
  return (
    <>
      <MainHeader />
      <main className="max-w-md mx-auto pt-15 text-white">
        <section className="px-5 relative h-full pb-26">
          <h2 className="text-2xl font-bold mb-6 sticky top-15 bg-background z-10 pt-6 pb-3">
            Carteira
          </h2>

          <div className="flex flex-col gap-4 overflow-y-auto h-full pt-2 -mt-4">
            {/* Card 1: Clínica da Família */}
            <WalletCard
              href="/wallet/health"
              title="Clínica da Família"
              name="Maria Sebastiana"
              statusLabel="Situação"
              statusValue="Normal"
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
        <FloatNavigation />
      </main>
    </>
  )
}
