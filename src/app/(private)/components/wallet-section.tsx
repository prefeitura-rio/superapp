import Link from 'next/link'
import { WalletCaretakerCard } from './wallet-caretaker-card'
import { WalletEducationCard } from './wallet-education-card'
import { WalletHealthCard } from './wallet-health-card'
import { WalletSocialAssistanceCard } from './wallet-social-assistance-card'

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

      <div className="flex flex-col gap-3 w-full">
        <WalletHealthCard
          href="/wallet/health"
          title="CLÍNICA DA FAMÍLIA"
          name="Maria Sebastiana"
          statusLabel="Situação"
          statusValue="Aberto"
          extraLabel="Horário de atendimento"
          extraValue="7h às 18h"
        />

        {/* Card 2: Educação */}
        <WalletEducationCard
          href="/wallet/education"
          title="ESCOLA"
          name="Maria Sebastiana"
          statusLabel="Situação"
          statusValue="Aberto"
          extraLabel="Horário de atendimento"
          extraValue="7h às 18h"
        />

        {/* Card 3: Assistência social */}
        <WalletSocialAssistanceCard
          href="/wallet/social-assistance"
          title="CADÚNICO"
          name="2653 1337 6854"
          statusLabel="Situação"
          statusValue="Atualizar"
          extraLabel="Data de recadastramento"
          extraValue="18.12.2025"
        />

        {/* Card 3: Zeladoria */}
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
  )
}
