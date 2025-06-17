import { FloatNavigation } from '../components/float-navation'
import MainHeader from '../components/main-header'
import { WalletCaretakerCard } from '../components/wallet-caretaker-card'
import { WalletEducationCard } from '../components/wallet-education-card'
import { WalletHealthCard } from '../components/wallet-health-card'
import { WalletSocialAssistanceCard } from '../components/wallet-social-assistance-card'

export default function Wallet() {
  return (
    <>
      <MainHeader />
      <main className="max-w-md mx-auto pt-15 text-white">
        <section className="px-5 relative h-full pb-30">
          <h2 className="text-2xl font-bold mb-6 bg-background z-10 pt-5 pb-3 text-foreground">
            Carteira
          </h2>

          <div className="flex flex-col gap-4 overflow-y-auto h-full pt-2 -mt-4">
            {/* Card 1: Clínica da Família */}
            <WalletHealthCard
              href="/wallet/health"
              title="CLÍNICA DA FAMÍLIA"
              name="Maria Sebastiana"
              statusLabel="Situação"
              statusValue="Normal"
              extraLabel="Horário de atendimento"
              extraValue="7h às 18h"
            />

            {/* Card 2: Educação */}
            <WalletEducationCard
              href="/wallet/education"
              title="ESCOLA"
              name="Escola Municipal Geyner EleuThério Rodrigues"
              statusLabel="Status"
              statusValue="Atualizar"
              extraLabel="Horário de atendimento"
              extraValue="7h às 18h"
            />

            {/* Card 3: Zeladoria */}
            <WalletSocialAssistanceCard
              href="/wallet/social-assistance"
              title="CADÚNICO"
              name="2653 1337 6854"
              statusLabel="Situação"
              statusValue="Atualizar"
              extraLabel="Data de recadastramento"
              extraValue="18.12.2025"
            />

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
        </section>
        <FloatNavigation />
      </main>
    </>
  )
}
