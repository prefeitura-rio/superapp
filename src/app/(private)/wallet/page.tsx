import { PageFadeInWrapper } from '@/components/ui/page-fade-in'
import { FloatNavigation } from '../components/float-navation'
import MainHeader from '../components/main-header'
import { WalletCaretakerCard } from '../components/wallet-caretaker-card'
import { WalletEducationCard } from '../components/wallet-education-card'
import { WalletHealthCard } from '../components/wallet-health-card'
import { WalletSocialAssistanceCard } from '../components/wallet-social-assistance-card'

export default function Wallet() {
  return (
    <PageFadeInWrapper>
      <MainHeader />
      <main className="max-w-md mx-auto pt-15 text-white">
        <section className="px-5 relative h-full pb-24">
          <h2 className="sticky top-16 text-2xl font-bold mb-6 bg-background z-10 pt-5 text-foreground">
            Carteira
          </h2>

          <div className="grid w-full gap-3">
            <div className="sticky top-34">
              <WalletHealthCard
                href="/wallet/health"
                title="CLÍNICA DA FAMÍLIA"
                name="Maria Sebastiana"
                statusLabel="Situação"
                statusValue="Aberto"
                extraLabel="Horário de atendimento"
                extraValue="7h às 18h"
              />
            </div>

            {/* Card 2: Educação */}
            <div className="sticky top-34">
              <WalletEducationCard
                href="/wallet/education"
                title="ESCOLA"
                name="Maria Sebastiana"
                statusLabel="Status"
                statusValue="Aberto"
                extraLabel="Horário de Atendimento"
                extraValue="7h às 18h"
              />
            </div>

            {/* Card 3: Assistência social */}
            <div className="sticky top-34">
              <WalletSocialAssistanceCard
                href="/wallet/social-assistance"
                title="CADÚNICO"
                name="2653 1337 6854"
                statusLabel="Situação"
                statusValue="Atualizar"
                extraLabel="Data de recadastramento"
                extraValue="18.12.2025"
              />
            </div>

            {/* Card 3: Zeladoria */}
            <div className="sticky top-34">
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
          </div>
        </section>
        <FloatNavigation />
      </main>
    </PageFadeInWrapper>
  )
}
