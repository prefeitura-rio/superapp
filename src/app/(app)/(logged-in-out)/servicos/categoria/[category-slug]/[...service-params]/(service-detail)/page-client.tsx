'use client'

import {
  DigitalChannels,
  LegislationItem,
  MainInformation,
  QuickInfo,
  QuickInfoAddress,
  QuickInfoCategory,
  QuickInfoCost,
  QuickInfoDepartment,
  QuickInfoTime,
} from '@/app/components/service'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'
import { TICKET_FORM_BASE_URL } from '@/constants/url'
import { useAnalytics } from '@/hooks/useAnalytics'
import type { ModelsButton } from '@/http-busca-search/models/modelsButton'
import type { ModelsPrefRioService } from '@/http-busca-search/models/modelsPrefRioService'
import type { ServiceTicketFlags } from '@/lib/carta-servicos/types'
import { formatTimestamp } from '@/lib/date'
import { formatTitleCase } from '@/lib/utils'
import { Clock } from 'lucide-react'
import { MarkdownRenderer } from './components/markdown-renderer'

interface PageClientProps {
  serviceData: ModelsPrefRioService
  orgaoGestorName: string | null
  ticketFlags?: ServiceTicketFlags
}

export function PageClient({
  serviceData,
  orgaoGestorName,
  ticketFlags,
}: PageClientProps) {
  const buttons: ModelsButton[] = serviceData?.buttons || []
  const enabledButtons = buttons.filter(btn => btn.is_enabled)

  const canSubmitTicket =
    ticketFlags?.allowTicketSubmission === true &&
    !!ticketFlags?.activeCategoryConfigId &&
    !!TICKET_FORM_BASE_URL

  const ticketUrl = (a: 0 | 1) =>
    `${TICKET_FORM_BASE_URL}?a=${a}&id=${ticketFlags?.activeCategoryConfigId}`

  // Analytics tracking
  const { trackServiceClick } = useAnalytics()

  // Handle button click tracking with delay to ensure event is sent
  const handleButtonClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    button: ModelsButton,
    index: number
  ) => {
    // Prevent immediate navigation
    event.preventDefault()

    // Track the event
    trackServiceClick({
      service_id: serviceData.id || '',
      service_name: serviceData.nome_servico,
      service_category: serviceData.tema_geral,
      button_label: button.titulo || '',
      button_index: index,
      destination_url: button.url_service || '',
    })

    // Allow navigation after a short delay to ensure event is sent
    setTimeout(() => {
      window.open(button.url_service, '_blank', 'noopener,noreferrer')
    }, 200)
  }

  // Extract data for QuickInfo
  const serviceCost = serviceData?.custo_servico
  const serviceTime = serviceData?.tempo_atendimento
  const category = serviceData?.tema_geral
  const addresses: string[] = serviceData?.canais_presenciais || []

  // Extract digital channels and legislation
  const digitalChannels: string[] = serviceData?.canais_digitais || []
  const legislation: string[] = serviceData?.legislacao_relacionada || []

  // Function to render markdown
  const renderMarkdown = (content: string) => (
    <MarkdownRenderer content={content} />
  )

  // Format last_update date (timestamp in seconds)
  const updatedAtFormatted = serviceData?.last_update
    ? formatTimestamp(serviceData.last_update)
    : null

  return (
    <>
      <div className="space-y-4 mb-8">
        {/* Title and Summary */}
        <div>
          <h1 className="text-4xl text-foreground leading-10 mb-2 font-medium">
            {serviceData.nome_servico}
          </h1>
          <MarkdownRenderer
            content={serviceData.resumo}
            className="text-sm font-normal text-foreground-light leading-5"
          />
        </div>

        {/* Ticket submission buttons (SF-linked services) take priority over generic buttons */}
        {canSubmitTicket ? (
          <div className="flex flex-col gap-3">
            <Button
              asChild
              className="w-full rounded-full text-background py-4 h-[52px]"
              size="lg"
            >
              <a
                href={ticketUrl(0)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-background text-sm leading-5 font-normal"
              >
                Solicitar serviço
              </a>
            </Button>
            {ticketFlags?.allowsAnonymity && (
              <Button
                asChild
                variant="outline"
                className="w-full rounded-full py-4 h-[52px]"
                size="lg"
              >
                <a
                  href={ticketUrl(1)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm leading-5 font-normal text-foreground hover:text-background"
                >
                  Solicitar sem login
                </a>
              </Button>
            )}
          </div>
        ) : (
          /* Fallback: generic buttons from API */
          enabledButtons.length > 0 && (
            <div>
              {enabledButtons.length === 1 ? (
                <Button
                  asChild
                  className="w-full rounded-full text-background py-4 h-[52px]"
                  size="lg"
                >
                  <a
                    href={enabledButtons[0].url_service}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => handleButtonClick(e, enabledButtons[0], 0)}
                    className="text-background text-sm leading-5 font-normal"
                  >
                    {formatTitleCase(enabledButtons[0].titulo || '', 'first')}
                  </a>
                </Button>
              ) : (
                <div className="flex gap-4 overflow-x-auto md:flex-wrap pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide md:justify-left">
                  {enabledButtons.map((button, index) => (
                    <Card
                      key={index}
                      className="min-w-[268px] w-[268px] md:w-[268px] min-h-[128px] flex-shrink-0 border-0 shadow-none bg-card flex flex-col gap-2"
                    >
                      <CardHeader className="p-6 py-0 min-w-0 overflow-hidden">
                        {button.descricao && (
                          <CardDescription className="text-sm text-foreground-light line-clamp-2">
                            {button.descricao}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="p-6 py-0 mt-auto">
                        <Button
                          asChild
                          className="w-full rounded-full h-11 text-background"
                        >
                          <a
                            href={button.url_service}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => handleButtonClick(e, button, index)}
                            className="text-background"
                          >
                            {button.titulo}
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* QuickInfo Items */}
      <div className="mb-8">
        <QuickInfo>
          {serviceCost && <QuickInfoCost value={serviceCost} />}
          {serviceTime && <QuickInfoTime value={serviceTime} />}
          {category && <QuickInfoCategory value={category} />}
          {addresses.length > 0 && <QuickInfoAddress addresses={addresses} />}
          {orgaoGestorName && <QuickInfoDepartment value={orgaoGestorName} />}
        </QuickInfo>
      </div>

      {/* Main Information */}
      <div className="mb-8">
        <MainInformation
          serviceData={serviceData}
          renderMarkdown={renderMarkdown}
        />
      </div>

      {/* Digital Channels */}
      <div className="mb-8">
        <DigitalChannels channels={digitalChannels} />
      </div>

      {/* Legislation */}
      {legislation.length > 0 && (
        <div className="space-y-4 mb-3">
          <h2 className="text-base font-medium text-foreground">Legislação</h2>
          <div className="flex flex-col gap-3">
            {legislation.map((law, index) => (
              <LegislationItem key={index} text={law} />
            ))}
          </div>
        </div>
      )}

      {/* Last Update */}
      {updatedAtFormatted && (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-foreground-light" />
          <span className="text-sm text-foreground-light leading-5 tracking-normal">
            Última atualização: {updatedAtFormatted}
          </span>
        </div>
      )}
    </>
  )
}
