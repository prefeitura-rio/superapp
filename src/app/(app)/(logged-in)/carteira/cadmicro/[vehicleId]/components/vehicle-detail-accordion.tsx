'use client'

import { CheckCircleIcon } from '@/assets/icons/check-circle-icon'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { VehicleDetail } from '@/lib/cadmicro/types'
import type { ReactNode } from 'react'
import { AuthorizedConductorsSection } from './authorized-conductors-section'
import { CirculationRulesSection } from './circulation-rules-section'
import { GeneralInfoSection } from './general-info-section'
import { VerifiedDocumentSection } from './verified-document-section'

interface VehicleDetailAccordionProps {
  vehicle: VehicleDetail
  showAuthorizedConductors?: boolean
}

export function VehicleDetailAccordion({
  vehicle,
  showAuthorizedConductors = true,
}: VehicleDetailAccordionProps) {
  return (
    <Accordion
      type="multiple"
      defaultValue={[]}
      className="flex w-full flex-col gap-2"
    >
      <DetailAccordionItem
        value="serial-number"
        title="Número de série"
        showVerified
      >
        <VerifiedDocumentSection
          message="O número de série foi verificado com sucesso."
          document={vehicle.serialNumberDocument}
          vehicleId={vehicle.id}
        />
      </DetailAccordionItem>

      <DetailAccordionItem value="invoice" title="Nota Fiscal" showVerified>
        <VerifiedDocumentSection
          message="A Nota Fiscal foi verificada com sucesso."
          document={vehicle.invoiceDocument}
          vehicleId={vehicle.id}
        />
      </DetailAccordionItem>

      <DetailAccordionItem value="general-info" title="Informações Gerais">
        <GeneralInfoSection vehicle={vehicle} />
      </DetailAccordionItem>

      {showAuthorizedConductors && (
        <DetailAccordionItem
          value="authorized-conductors"
          title="Condutores autorizados"
        >
          <AuthorizedConductorsSection
            vehicleId={vehicle.id}
            conductors={vehicle.authorizedConductors}
          />
        </DetailAccordionItem>
      )}

      <DetailAccordionItem
        value="circulation-rules"
        title="Regras de Circulação"
      >
        <CirculationRulesSection />
      </DetailAccordionItem>
    </Accordion>
  )
}

function DetailAccordionItem({
  value,
  title,
  showVerified = false,
  children,
}: DetailAccordionItemProps) {
  return (
    <AccordionItem value={value} className="rounded-2xl border-0 bg-card">
      <AccordionTrigger
        className="px-4 pt-4 pb-0 hover:no-underline data-[state=closed]:pb-4"
        chevronClassName="text-foreground stroke-[1.5]"
      >
        <div className="flex items-center gap-1 text-left">
          <span className="text-base font-medium leading-5 text-foreground">
            {title}
          </span>
          {showVerified && (
            <CheckCircleIcon className="size-6 shrink-0 text-wallet-2b" />
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pt-4 pb-4">{children}</AccordionContent>
    </AccordionItem>
  )
}

interface DetailAccordionItemProps {
  value: string
  title: string
  showVerified?: boolean
  children: ReactNode
}
