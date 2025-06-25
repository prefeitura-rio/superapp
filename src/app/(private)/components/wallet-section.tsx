import { TransitionLink } from '@/components/ui/transition-link'
import { WalletCaretakerCard } from './wallet-caretaker-card'
import { WalletEducationCard } from './wallet-education-card'
import { WalletHealthCard } from './wallet-health-card'
import { WalletSocialAssistanceCard } from './wallet-social-assistance-card'

export default function CarteiraSection() {
  return (
    <section className="px-5 mt-6 pb-24">
      <div className="sticky top-20 flex items-center justify-between mb-4">
        <h2 className="text-md font-medium text-foreground">Carteira</h2>
        <TransitionLink
          href="/wallet"
          className="text-md text-[#A2A2A2] cursor-pointer font-medium"
        >
          ver tudo
        </TransitionLink>
      </div>

      <div className="grid w-full gap-3">
        <div className="sticky top-30">
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
        <div className="sticky top-30">
          <WalletEducationCard
            href="/wallet/education"
            title="ESCOLA"
            name="Maria Sebastiana"
            statusLabel="Status"
            statusValue="Aberto"
            extraLabel="Horário de atendimento"
            extraValue="7h às 18h"
          />
        </div>

        {/* Card 3: Assistência social */}
        <div className="sticky top-30">
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
        <div className="sticky top-30">
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
  )
}
