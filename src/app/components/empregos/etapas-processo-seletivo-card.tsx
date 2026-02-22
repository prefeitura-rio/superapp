'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { EtapaProcessoSeletivo } from '@/lib/emprego-utils'
import { EmpregabilidadeStatusCandidatura } from '@/http-courses/models'
import { Check, X } from 'lucide-react'

const ETAPA_ENVIO_CANDIDATURA = {
  ordem: 1,
  titulo: 'Envio da candidatura',
  descricao: 'Envio do formulário de inscrição para a vaga.',
} as const

const STATUS_COM_MENSAGEM_REPROVACAO = [
  EmpregabilidadeStatusCandidatura.StatusCandidaturaReprovada,
  EmpregabilidadeStatusCandidatura.StatusCandidaturaVagaCongelada,
  EmpregabilidadeStatusCandidatura.StatusCandidaturaDescontinuada,
] as const

const MENSAGEM_NAO_SEGUIU_CANDIDATURA =
  'Infelizmente não foi possível seguir com a sua candidatura. Fique atento(a) a novas oportunidades!'

interface EtapasProcessoSeletivoCardProps {
  etapas: EtapaProcessoSeletivo[]
  /** Índice da etapa atual do candidato (0-based no array de etapas da API); quando definido, indica etapa em que está. */
  etapaAtualCandidatura?: number
  /** Status da candidatura; quando reprovada/congelada/descontinuada, a etapa atual exibe X e mensagem. */
  statusCandidatura?: string
  /** Quando true, a etapa "Envio da candidatura" é exibida como concluída; quando false (usuário não se candidatou), exibe como não concluída. */
  hasCandidatura?: boolean
}

/** Monta a lista de exibição: etapa 1 = Envio da candidatura (sempre concluída), etapas 2+ = array original renumerado. */
function buildEtapasComEnvio(etapas: EtapaProcessoSeletivo[]) {
  const envio = {
    ...ETAPA_ENVIO_CANDIDATURA,
  }
  const demais = etapas.map((etapa, index) => ({
    ...etapa,
    ordem: index + 2,
  }))
  return [envio, ...demais]
}

export function EtapasProcessoSeletivoCard({
  etapas,
  etapaAtualCandidatura,
  statusCandidatura,
  hasCandidatura = false,
}: EtapasProcessoSeletivoCardProps) {
  if (!etapas?.length) return null

  const etapasExibicao = buildEtapasComEnvio(etapas)
  const isStatusRejeitado =
    statusCandidatura != null &&
    (STATUS_COM_MENSAGEM_REPROVACAO as readonly string[]).includes(
      statusCandidatura
    )

  const defaultOpen =
    etapaAtualCandidatura != null && etapaAtualCandidatura >= 0
      ? `etapa-${etapaAtualCandidatura + 1}`
      : undefined

  return (
    <section>
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
          {etapasExibicao.map((etapa, index) => {
            const value = `etapa-${index}`
            const isEnvioCandidatura = index === 0
            const isEtapaAtualRejeitada =
              isStatusRejeitado &&
              etapaAtualCandidatura != null &&
              index === etapaAtualCandidatura + 1
            const isCompleted =
              (isEnvioCandidatura && hasCandidatura) ||
              (!isEnvioCandidatura &&
                etapaAtualCandidatura != null &&
                index - 1 <= etapaAtualCandidatura)
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
                      {isEtapaAtualRejeitada ? (
                        <span className="flex size-4 items-center justify-center rounded-full bg-destructive text-white">
                          <X className="size-3 stroke-[2.5]" />
                        </span>
                      ) : isCompleted ? (
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
                  {isEtapaAtualRejeitada && (
                    <p className="mt-3 text-foreground font-normal">
                      {MENSAGEM_NAO_SEGUIU_CANDIDATURA}
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
    </section>
  )
}
