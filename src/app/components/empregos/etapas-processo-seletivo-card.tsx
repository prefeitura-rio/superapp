'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { EtapaProcessoSeletivo } from '@/lib/emprego-utils'
import { Check } from 'lucide-react'

interface EtapasProcessoSeletivoCardProps {
  etapas: EtapaProcessoSeletivo[]
  /** Índice da etapa atual do candidato (0-based); quando definido, indica etapa em que está */
  etapaAtualCandidatura?: number
}

export function EtapasProcessoSeletivoCard({
  etapas,
  etapaAtualCandidatura,
}: EtapasProcessoSeletivoCardProps) {
  if (!etapas?.length) return null

  const defaultOpen =
    etapaAtualCandidatura != null && etapaAtualCandidatura >= 0
      ? `etapa-${etapaAtualCandidatura}`
      : undefined

  return (
    <section className="pt-6">
      <h3 className="text-sm font-normal leading-5 text-foreground mb-2">
        Etapas do processo seletivo
      </h3>
      <div className="bg-card rounded-xl p-4">
        <Accordion
          type="single"
          collapsible
          defaultValue={defaultOpen}
          className="w-full"
        >
          {etapas.map((etapa, index) => {
            const value = `etapa-${index}`
            const isCompleted =
              etapaAtualCandidatura != null && index < etapaAtualCandidatura
            const hasContent = Boolean(etapa.descricao?.trim())

            return (
              <AccordionItem key={value} value={value} className="border-0">
                <AccordionTrigger
                  className="py-3 hover:no-underline data-[state=open]:pb-2"
                  chevronClassName="text-primary stroke-[1.5]"
                >
                  <div className="flex items-center gap-2 text-left flex-1 min-w-0">
                    <span className="text-sm font-normal leading-5 text-foreground min-w-0">
                      {etapa.ordem}. {etapa.titulo}
                    </span>
                    <span className="shrink-0 flex items-center justify-center size-5">
                      {isCompleted ? (
                        <span className="flex size-4 items-center justify-center rounded-full bg-wallet-2b text-white">
                          <Check className="size-3 stroke-[2.5]" />
                        </span>
                      ) : (
                        <span className="size-4 rounded-full border-2 border-dashed border-muted-foreground" />
                      )}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-foreground-light text-sm leading-5 font-normal pb-3 pt-0">
                  {hasContent ? etapa.descricao : 'Etapa sem descrição.'}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
    </section>
  )
}
