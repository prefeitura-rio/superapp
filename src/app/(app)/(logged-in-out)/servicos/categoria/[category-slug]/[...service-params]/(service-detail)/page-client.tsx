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
import type { ModelsButton } from '@/http-busca-search/models/modelsButton'
import type { ModelsPrefRioService } from '@/http-busca-search/models/modelsPrefRioService'
import { formatTimestamp } from '@/lib/date'
import { formatTitleCase } from '@/lib/utils'
import { Clock } from 'lucide-react'
import { MarkdownRenderer } from './components/markdown-renderer'

interface PageClientProps {
  serviceData: ModelsPrefRioService
  orgaoGestorName: string | null
}

export function PageClient({ serviceData, orgaoGestorName }: PageClientProps) {
  const buttons: ModelsButton[] = serviceData?.buttons || []
  const enabledButtons = buttons.filter(btn => btn.is_enabled)

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

        {/* Buttons - One Button or Multiple Buttons */}
        {enabledButtons.length > 0 && (
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
                    className="min-w-[268px] max-w-[268px] md:max-w-[268px] min-h-[188px] flex-shrink-0 border-0 shadow-none bg-card flex flex-col"
                  >
                    <CardHeader className="p-6 pb-0 flex-1">
                      {button.descricao && (
                        <CardDescription className="text-sm">
                          {button.descricao}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="p-6 pt-4 mt-auto">
                      <Button
                        asChild
                        className="w-full rounded-full h-11 text-background"
                      >
                        <a
                          href={button.url_service}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-background"
                        >
                          Acessar informação
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
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
