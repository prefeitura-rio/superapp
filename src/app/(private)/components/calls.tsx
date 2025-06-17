'use client'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'

// Helper function to get status color based on statusChamado
function getStatusColor(statusChamado: string) {
  switch (statusChamado) {
    case 'Aberto':
      return 'bg-card-5'
    case 'Concluído':
      return 'bg-card-3'
    case 'Não Resolvido':
      return 'bg-zinc-500'
    default:
      return 'bg-card'
  }
}

// Helper to get prazoFechamento or '-' for 'Não Resolvido'
function getPrazoOrFechamento(call: any) {
  if (call.details.statusChamado === 'Não Resolvido') return '-'
  return call.details.prazoFechamento
}

// Helper to get label for prazo/fechamento
function getPrazoOrFechamentoLabel(call: any) {
  if (call.details.statusChamado === 'Concluído') return 'Data fechamento'
  return 'Prazo de fechamento'
}

// Sample data for the calls
const callsData = [
  {
    id: '1',
    title: 'Reparo de lâmpada apagada',
    status: 'Aberto',
    openedDate: '25.05.2025',
    details: {
      tipo: 'Iluminação Pública',
      subtipo: 'Reparo de lâmpada apagada',
      prazoFechamento: '13.06.25',
      orgao: 'RIOLUZ',
      statusChamado: 'Aberto',
      origem: 'Teleatendimento',
      endereco: 'Rua das Laranjeiras, 211 Laranjeiras',
    },
  },
  {
    id: '2',
    title: 'Fiscalização de buraco',
    status: 'Concluído',
    openedDate: '19.05.2024',
    details: {
      tipo: 'Infraestrutura Urbana',
      subtipo: 'Fiscalização de buraco',
      prazoFechamento: '02.06.24',
      orgao: 'SECONSERVA',
      statusChamado: 'Concluído',
      origem: 'Aplicativo',
      endereco: 'Av. Atlântica, 1500 Copacabana',
    },
  },
  {
    id: '3',
    title: 'Manutenção / Desobstrução de Via',
    status: 'Não Resolvido',
    openedDate: '20.05.2024',
    details: {
      tipo: 'Limpeza Urbana',
      subtipo: 'Desobstrução de via pública',
      prazoFechamento: '05.06.24',
      orgao: 'COMLURB',
      statusChamado: 'Não Resolvido',
      origem: 'Website',
      endereco: 'Rua Visconde de Pirajá, 550 Ipanema',
    },
  },
]

function Calls() {
  return (
    <div className="p-6">
      <div className="mb-2">
        <h2 className="font-medium text-foreground">Meus chamados</h2>
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {callsData.map(call => (
          <AccordionItem
            key={call.id}
            value={call.id}
            className="rounded-lg bg-card px-4"
          >
            <AccordionTrigger className="hover:no-underline pt-4 pb-4">
              <div className="flex flex-col items-start text-left w-full">
                <div className="flex items-center justify-between w-full mb-2">
                  <Badge
                    className={`${getStatusColor(call.details.statusChamado)} text-white`}
                  >
                    {call.status}
                  </Badge>
                </div>
                <h3 className="text-sm font-normal text-card-foreground">
                  {call.title}
                </h3>
                <p className="text-sm font-normal text-muted-foreground">
                  Aberto em {call.openedDate}
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              {call.details.statusChamado === 'Não Resolvido' ? (
                <div className="bg-terciary rounded-lg p-2 mb-5">
                  <span className="text-xs font-normal text-card-foreground">
                    Este serviço não tem como ser realizado. Para mais detalhes verifique seu e-mail.
                  </span>
                </div>
              ) : null}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-foreground-light pr-1">Tipo de chamado</span>
                  <span className="text-card-foreground font-medium">
                    {call.details.tipo}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-foreground-light pr-1">Subtipo do chamado</span>
                  <span className="text-card-foreground font-medium text-right">
                    {call.details.subtipo}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-foreground-light pr-1">{getPrazoOrFechamentoLabel(call)}</span>
                  <span className="text-card-foreground font-medium">
                    {getPrazoOrFechamento(call)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-foreground-light pr-1">Órgão</span>
                  <span className="text-card-foreground font-medium">
                    {call.details.orgao}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-foreground-light pr-1">Status do chamado</span>
                  <span className="text-card-foreground font-medium">
                    {call.details.statusChamado}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-foreground-light pr-1">Origem do chamado</span>
                  <span className="text-card-foreground font-medium">
                    {call.details.origem}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-foreground-light pr-1">Endereço da solicitação</span>
                  <span className="text-card-foreground font-medium text-right max-w-[60%]">
                    {call.details.endereco}
                  </span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

export default Calls
