'use client'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import type { ModelsMaintenanceRequest } from '@/http/models'
import {
  formatMaintenanceRequestDate,
  getMaintenanceRequestDateLabel,
  getMaintenanceRequestDateValue,
  getMaintenanceRequestDisplayStatus,
  getMaintenanceRequestStatusColor,
} from '@/lib/maintenance-requests-utils'

interface CallsAccordionProps {
  requests: ModelsMaintenanceRequest[]
}

export function CallsAccordion({ requests }: CallsAccordionProps) {
  return (
    <Accordion type="single" collapsible className="space-y-2">
      {requests.map(request => (
        <AccordionItem
          key={request.id}
          value={request.id || ''}
          className="rounded-lg bg-card px-4"
        >
          <AccordionTrigger className="hover:no-underline pt-4 pb-4">
            <div className="flex flex-col items-start text-left w-full">
              <div className="flex items-center justify-between w-full mb-2">
                <Badge
                  className={`${getMaintenanceRequestStatusColor(request.status || '')} text-white`}
                >
                  {getMaintenanceRequestDisplayStatus(request.status || '')}
                </Badge>
              </div>
              <h3 className="text-sm font-normal text-card-foreground">
                {request.subtipo || 'Sem descrição'}
              </h3>
              <p className="text-sm font-normal text-muted-foreground">
                Aberto em {formatMaintenanceRequestDate(request.data_inicio)}
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            {request.status === 'Não resolvido' ? (
              <div className="bg-terciary rounded-lg p-2 mb-5">
                <span className="text-xs font-normal text-card-foreground">
                  Este serviço não tem como ser realizado. Para mais detalhes
                  verifique seu e-mail.
                </span>
              </div>
            ) : null}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-foreground-light whitespace-nowrap">
                  Tipo de chamado
                </span>
                <span className="text-card-foreground line-clamp-2 font-medium text-right">
                  {request.tipo || '-'}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-foreground-light whitespace-nowrap">
                  Subtipo do chamado
                </span>
                <span className="text-card-foreground line-clamp-2 font-medium text-right">
                  {request.subtipo || '-'}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-foreground-light whitespace-nowrap">
                  {getMaintenanceRequestDateLabel(request.status || '')}
                </span>
                <span className="text-card-foreground line-clamp-2 font-medium text-right">
                  {getMaintenanceRequestDateValue(request)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-foreground-light whitespace-nowrap">
                  Órgão
                </span>
                <span className="text-card-foreground line-clamp-2 font-medium text-right">
                  {request.nome_unidade_organizacional || '-'}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-foreground-light whitespace-nowrap">
                  Status do chamado
                </span>
                <span className="text-card-foreground line-clamp-2 font-medium text-right">
                  {getMaintenanceRequestDisplayStatus(request.status || '')}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-foreground-light whitespace-nowrap">
                  Origem do chamado
                </span>
                <span className="text-card-foreground line-clamp-2 font-medium text-right">
                  {request.origem_ocorrencia || '-'}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-foreground-light whitespace-nowrap">
                  Endereço da solicitação
                </span>
                <span className="text-card-foreground line-clamp-2 font-medium text-right">
                  {request.id_bairro || 'Não informado'}
                </span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
