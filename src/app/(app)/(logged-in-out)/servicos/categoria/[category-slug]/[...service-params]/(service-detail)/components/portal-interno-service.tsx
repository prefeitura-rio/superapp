import { Button } from '@/components/ui/button'
import { convertUrlsToLinks, ensureUrlProtocol } from '@/lib/url-utils'
import type { ServiceFromPortalInterno } from '@/types/portal-interno'
import Link from 'next/link'
import { CollapsibleText } from './collapsible-text'

interface PortalInternoServiceProps {
  serviceData: ServiceFromPortalInterno
}

export function PortalInternoServiceComponent({
  serviceData,
}: PortalInternoServiceProps) {
  return (
    <>
      {/* Service Title */}
      <h1 className="text-2xl font-semibold text-foreground leading-8 mb-2">
        {serviceData.nome_servico}
      </h1>

      {/* Service Summary */}
      <p className="text-sm text-foreground-light leading-5 mb-6 max-w-4xl">
        {serviceData.resumo}
      </p>

      {serviceData?.service_url && (
        <Button
          asChild
          variant="default"
          size="lg"
          className="mb-6 rounded-full text-background"
        >
          <Link
            href={ensureUrlProtocol(serviceData.service_url)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Acessar serviço
          </Link>
        </Button>
      )}

      {/* Divider */}
      <div className="border-b border-border mb-6" />

      {/* Expected Timeframe Section */}
      {serviceData.tempo_atendimento && (
        <div className="mb-4">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Prazo
          </h2>
          <p className="text-sm text-foreground-light leading-5">
            {serviceData.tempo_atendimento}
          </p>
        </div>
      )}

      {/* Service Cost */}
      {serviceData.custo_servico && (
        <div className="mb-4">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Custo
          </h2>
          <p className="text-sm text-foreground-light leading-5 capitalize">
            {serviceData.custo_servico}
            {serviceData.is_free && (
              <span className="block mt-1 text-green-600 font-medium">
                Serviço gratuito
              </span>
            )}
          </p>
        </div>
      )}

      {/* Complete Description */}
      {serviceData.descricao_completa && (
        <div className="mb-4">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Descrição Completa
          </h2>
          <CollapsibleText text={serviceData.descricao_completa} />
        </div>
      )}

      {/* Instructions for Requester */}
      {serviceData.instrucoes_solicitante && (
        <div className="mb-4">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Instruções para o Solicitante
          </h2>
          <div className="text-sm text-foreground-light leading-5 whitespace-pre-wrap">
            {convertUrlsToLinks(serviceData.instrucoes_solicitante)}
          </div>
        </div>
      )}

      {/* Required Documents */}
      {serviceData.documentos_necessarios &&
        serviceData.documentos_necessarios.length > 0 && (
          <div className="mb-4">
            <h2 className="text-base font-medium text-foreground leading-5 mb-2">
              Documentos Necessários
            </h2>
            <div className="text-sm text-foreground-light leading-5 whitespace-pre-wrap">
              {serviceData.documentos_necessarios[0]}
            </div>
          </div>
        )}

      {/* What this service doesn't cover */}
      {serviceData.servico_nao_cobre && (
        <div className="mb-4">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Este serviço não cobre
          </h2>
          <CollapsibleText text={serviceData.servico_nao_cobre} />
        </div>
      )}

      {/* Expected Result */}
      {serviceData.resultado_solicitacao && (
        <div className="mb-4">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Resultado da Solicitação
          </h2>
          <p className="text-sm text-foreground-light leading-5">
            {serviceData.resultado_solicitacao}
          </p>
        </div>
      )}

      {/* Service Channels */}
      {(serviceData.canais_digitais &&
        serviceData.canais_digitais.length > 0) ||
      (serviceData.canais_presenciais &&
        serviceData.canais_presenciais.length > 0) ? (
        <div className="mb-4">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Canais de Atendimento
          </h2>
          <div className="space-y-2">
            {serviceData.canais_digitais &&
              serviceData.canais_digitais.length > 0 && (
                <div>
                  <span className="text-sm text-foreground-light font-medium">
                    Canais Digitais:
                  </span>
                  <ul className="mt-1 space-y-1">
                    {serviceData.canais_digitais.map((canal, index) => (
                      <li
                        key={index}
                        className="text-sm text-foreground-light leading-5"
                      >
                        • {canal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            {serviceData.canais_presenciais &&
              serviceData.canais_presenciais.length > 0 && (
                <div>
                  <span className="text-sm text-foreground-light font-medium">
                    Canais Presenciais:
                  </span>
                  <ul className="mt-1 space-y-1">
                    {serviceData.canais_presenciais.map((canal, index) => (
                      <li
                        key={index}
                        className="text-sm text-foreground-light leading-5"
                      >
                        • {canal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </div>
      ) : null}

      {/* Target Audience */}
      {serviceData.publico_especifico &&
        serviceData.publico_especifico.length > 0 && (
          <div className="mb-4">
            <h2 className="text-base font-medium text-foreground leading-5 mb-2">
              Público Específico
            </h2>
            <p className="text-sm text-foreground-light leading-5">
              {serviceData.publico_especifico[0].charAt(0).toUpperCase() +
                serviceData.publico_especifico[0].slice(1)}
            </p>
          </div>
        )}

      {/* General Theme */}
      {serviceData.tema_geral && (
        <div className="mb-4">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Tema Geral
          </h2>
          <p className="text-sm text-foreground-light leading-5">
            {serviceData.tema_geral.charAt(0).toUpperCase() +
              serviceData.tema_geral.slice(1)}
          </p>
        </div>
      )}

      {/* Related Legislation */}
      {serviceData.legislacao_relacionada &&
        serviceData.legislacao_relacionada.length > 0 && (
          <div className="mb-4">
            <h2 className="text-base font-medium text-foreground leading-5 mb-2">
              Legislação Relacionada
            </h2>
            <ul className="space-y-1">
              {serviceData.legislacao_relacionada.map((lei, index) => (
                <li
                  key={index}
                  className="text-sm text-foreground-light leading-5"
                >
                  • {lei}
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* Responsible Agency */}
      {serviceData.orgao_gestor && serviceData.orgao_gestor.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Órgão Gestor
          </h2>
          <p className="text-sm text-foreground-light leading-5 uppercase">
            {serviceData.orgao_gestor[0]}
          </p>
        </div>
      )}
    </>
  )
}
