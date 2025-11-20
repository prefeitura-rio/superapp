'use client'

import type { ModelsPrefRioService } from '@/http-busca-search/models/modelsPrefRioService'
import { TextBlock } from './TextBlocks'

interface MainInformationProps {
  serviceData: ModelsPrefRioService
  renderMarkdown: (content: string) => React.ReactNode
}

export function MainInformation({
  serviceData,
  renderMarkdown,
}: MainInformationProps) {
  // Prepare text blocks from service data
  const blocks = [
    {
      title: 'Descrição completa do serviço',
      content: serviceData?.descricao_completa,
    },
    {
      title: 'Como solicitar',
      content: serviceData?.instrucoes_solicitante,
    },
    {
      title: 'Resultado da solicitação',
      content: serviceData?.resultado_solicitacao,
    },
    {
      title: 'Documentos necessários',
      content: serviceData?.documentos_necessarios,
    },
    {
      title: 'O que o serviço não cobre',
      content: serviceData?.servico_nao_cobre,
    },
  ]

  // Filter blocks that have valid content
  const validBlocks = blocks.filter(
    block =>
      block.content &&
      (typeof block.content === 'string'
        ? block.content.trim()
        : block.content.length > 0)
  )

  if (validBlocks.length === 0) return null

  return (
    <div className="space-y-6">
      {/* Section title */}
      <h2 className="text-base font-medium text-foreground leading-5 tracking-normal">
        Principais informações
      </h2>

      {/* Text blocks */}
      <div className="flex flex-col gap-2">
        {validBlocks.map((block, index) => (
          <TextBlock
            key={index}
            title={block.title}
            content={block.content!}
            renderMarkdown={renderMarkdown}
          />
        ))}
      </div>
    </div>
  )
}
