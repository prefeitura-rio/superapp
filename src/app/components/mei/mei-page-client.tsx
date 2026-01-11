'use client'

import { Fragment } from 'react'
import { MeiHeader } from './mei-header'
import { type MeiOpportunity, MeiOpportunityCard } from './mei-opportunity-card'
import { type MeiProposal, MeiProposalCard } from './mei-proposal-card'
import { ServiceTypeToggle } from './service-type-toggle'

interface MeiPageClientProps {
  opportunities: MeiOpportunity[]
  isLoggedIn: boolean
  userProposals?: MeiProposal[]
}

export function MeiPageClient({
  opportunities,
  isLoggedIn,
  userProposals = [],
}: MeiPageClientProps) {
  const hasProposals = userProposals.length > 0
  const hasOpportunities = opportunities.length > 0

  if (!hasOpportunities && !hasProposals) {
    return (
      <div className="min-h-lvh">
        <MeiHeader isLoggedIn={isLoggedIn} />
        <main className="max-w-4xl mx-auto pt-24 pb-34 px-4">
          <div className="mb-6">
            <ServiceTypeToggle activeType="mei" />
          </div>
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-lg text-muted-foreground text-center">
              Nenhuma oportunidade encontrada
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-lvh">
      <MeiHeader isLoggedIn={isLoggedIn} />
      <main className="max-w-4xl mx-auto pt-24 pb-34 px-4">
        <div className="mb-12 mt-2">
          <ServiceTypeToggle activeType="mei" />
        </div>

        {/* Minhas oportunidades - só aparece se tiver propostas */}
        {hasProposals && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Minhas oportunidades
            </h2>

            {/* Mobile: column layout with dividers */}
            <div className="flex flex-col sm:hidden">
              {userProposals.map((proposal, index) => (
                <Fragment key={proposal.id}>
                  <MeiProposalCard proposal={proposal} />
                  {index < userProposals.length - 1 && (
                    <div className="h-px w-full bg-border my-4" />
                  )}
                </Fragment>
              ))}
            </div>

            {/* Desktop: grid layout - always 4 columns */}
            <div className="hidden sm:grid sm:grid-cols-4 gap-3">
              {userProposals.map(proposal => (
                <MeiProposalCard key={proposal.id} proposal={proposal} />
              ))}
            </div>
          </section>
        )}

        {/* Todas as oportunidades */}
        {hasOpportunities && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Todas as oportunidades
            </h2>

            {/* Mobile: column layout with dividers */}
            <div className="flex flex-col sm:hidden">
              {opportunities.map((opportunity, index) => (
                <Fragment key={opportunity.id}>
                  <MeiOpportunityCard opportunity={opportunity} />
                  {index < opportunities.length - 1 && (
                    <div className="h-px w-full bg-border my-4" />
                  )}
                </Fragment>
              ))}
            </div>

            {/* Desktop: grid layout - always 4 columns */}
            <div className="hidden sm:grid sm:grid-cols-4 gap-3">
              {opportunities.map(opportunity => (
                <MeiOpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
