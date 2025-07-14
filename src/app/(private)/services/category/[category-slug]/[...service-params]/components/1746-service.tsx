import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { applyCategoriaRules } from '@/lib/content-rules'
import type { Service1746 } from '@/types/1746'
import Link from 'next/link'

interface Service1746Props {
  serviceData: Service1746
}

export function Service1746Component({ serviceData }: Service1746Props) {
  return (
    <>
      {/* Service Title */}
      <h1 className="text-2xl font-semibold text-foreground leading-8 mb-2">
        {serviceData.titulo}
      </h1>

      {/* Service Description */}
      <p className="text-sm text-foreground-light leading-5 mb-6">
        {serviceData.descricao}
      </p>

      {/* Expected Timeframe Section */}
      {(serviceData.prazo_execucao || serviceData.prazo_atendimento) && (
        <div className="mb-4">
          <h2 className="text-base font-medium text-foreground leading-5 mb-1">
            Prazo esperado
          </h2>
          <p className="text-sm text-foreground-light leading-5">
            {serviceData.prazo_execucao || serviceData.prazo_atendimento}
          </p>
        </div>
      )}

      {/* Access Service Button */}
      {serviceData.url && (
        <Button
          asChild
          variant="default"
          size="lg"
          className="mb-6 rounded-full"
        >
          <Link
            href={serviceData.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Acessar serviço
          </Link>
        </Button>
      )}

      {/* Divider */}
      <div className="border-b border-border mb-6" />

      {/* Related Services Section */}
      {/* {serviceData.palavras_chave && serviceData.palavras_chave.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Palavras-chave
          </h2>
          <div className="flex flex-wrap gap-1">
            {serviceData.palavras_chave.map((keyword, index) => (
              <Badge variant="secondary" key={index} className="py-1.5 bg-card">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )} */}

      {/* Divider */}
      {/* <div className="border-b border-border mb-6" /> */}

      {/* How to Request Section */}
      {serviceData.como_solicitar && (
        <div className="mb-6">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Como solicitar
          </h2>
          <div className="text-sm text-foreground-light leading-5 whitespace-pre-wrap">
            {serviceData.como_solicitar}
          </div>
        </div>
      )}

      {/* Objective */}
      {serviceData.objetivo && (
        <div className="mb-6">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Objetivo
          </h2>
          <p className="text-sm text-foreground-light leading-5">
            {serviceData.objetivo}
          </p>
        </div>
      )}

      {/* Process Steps */}
      {serviceData.etapas_processo &&
        serviceData.etapas_processo.length > 0 && (
          <div className="mb-6">
            <h2 className="text-base font-medium text-foreground leading-5 mb-2">
              Etapas
            </h2>
            <div className="space-y-4">
              {serviceData.etapas_processo.map((step, index) => (
                <div key={index} className="bg-card p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-card-foreground leading-5 font-medium">
                      {index + 1}.
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-card-foreground leading-5">
                        {step}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Requirements */}
      {serviceData.requisitos && (
        <div className="mb-6">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Requisitos
          </h2>
          <p className="text-sm text-foreground-light leading-5">
            {serviceData.requisitos}
          </p>
        </div>
      )}

      {/* Required Documents */}
      {serviceData.documentos_necessarios &&
        serviceData.documentos_necessarios.length > 0 && (
          <div className="mb-6">
            <h2 className="text-base font-medium text-foreground leading-5 mb-2">
              Documentos Necessários
            </h2>
            <ul className="space-y-1">
              {serviceData.documentos_necessarios.map((doc, index) => (
                <li
                  key={index}
                  className="text-sm text-foreground-light leading-5"
                >
                  • {doc}
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* Optional Documents */}
      {serviceData.documentos_opcionais &&
        serviceData.documentos_opcionais.length > 0 && (
          <div className="mb-6">
            <h2 className="text-base font-medium text-foreground leading-5 mb-2">
              Documentos Opcionais
            </h2>
            <ul className="space-y-1">
              {serviceData.documentos_opcionais.map((doc, index) => (
                <li
                  key={index}
                  className="text-sm text-foreground-light leading-5"
                >
                  • {doc}
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* Service Details */}
      <div className="mb-6">
        <h2 className="text-base font-medium text-foreground leading-5 mb-2">
          Detalhes do Serviço
        </h2>
        <div className="space-y-2">
          {serviceData.custo_servico && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground-light">Custo:</span>
              <Badge variant="secondary" className="text-xs capitalize bg-card">
                {serviceData.custo_servico}
              </Badge>
            </div>
          )}
          {serviceData.categoria_servico && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground-light">Categoria:</span>
              <Badge variant="secondary" className="text-xs capitalize bg-card">
                {applyCategoriaRules(serviceData.categoria_servico)}
              </Badge>
            </div>
          )}
          {serviceData.publico_alvo && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground-light">
                Público Alvo:
              </span>
              <Badge variant="secondary" className="text-xs capitalize bg-card">
                {serviceData.publico_alvo}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Contact Information */}
      {(serviceData.enderecos_atendimento &&
        serviceData.enderecos_atendimento.length > 0) ||
      (serviceData.telefones_contato &&
        serviceData.telefones_contato.length > 0) ? (
        <div className="mb-6">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Informações de Contato
          </h2>
          <div className="space-y-2">
            {serviceData.enderecos_atendimento &&
              serviceData.enderecos_atendimento.length > 0 && (
                <div>
                  <span className="text-sm text-foreground-light font-medium">
                    Endereços:
                  </span>
                  <ul className="mt-1 space-y-1">
                    {serviceData.enderecos_atendimento.map(
                      (endereco, index) => (
                        <li
                          key={index}
                          className="text-sm text-foreground-light leading-5"
                        >
                          • {endereco}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            {serviceData.telefones_contato &&
              serviceData.telefones_contato.length > 0 && (
                <div>
                  <ul className="mt-1 space-y-1">
                    {serviceData.telefones_contato.map((telefone, index) => (
                      <li
                        key={index}
                        className="text-sm text-foreground-light leading-5"
                      >
                        • {telefone}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </div>
      ) : null}

      {/* What doesn't serve */}
      {serviceData.o_que_nao_atende && (
        <div className="mb-6">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            O que não atende
          </h2>
          <p className="text-sm text-foreground-light leading-5">
            {serviceData.o_que_nao_atende}
          </p>
        </div>
      )}

      {/* Limitations */}
      {serviceData.limitacoes && serviceData.limitacoes.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Limitações
          </h2>
          <ul className="space-y-1">
            {serviceData.limitacoes.map((limitacao, index) => (
              <li
                key={index}
                className="text-sm text-foreground-light leading-5"
              >
                • {limitacao}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Related Legislation */}
      {serviceData.legislacao_relacionada &&
        serviceData.legislacao_relacionada.length > 0 && (
          <div className="mb-6">
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

      {/* Additional Information */}
      {(serviceData.informacoes_complementares ||
        serviceData.horario_funcionamento ||
        serviceData.como_orgao_atua) && (
        <div className="mb-6">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Informações Complementares
          </h2>
          {serviceData.informacoes_complementares && (
            <p className="text-sm text-foreground-light leading-5 mb-2">
              {serviceData.informacoes_complementares}
            </p>
          )}
          {serviceData.horario_funcionamento && (
            <p className="text-sm text-foreground-light leading-5 mb-2">
              <span className="font-medium">Horário de Funcionamento: </span>
              {serviceData.horario_funcionamento}
            </p>
          )}
          {serviceData.como_orgao_atua && (
            <p className="text-sm text-foreground-light leading-5">
              <span className="font-medium">Como o Órgão Atua: </span>
              {serviceData.como_orgao_atua}
            </p>
          )}
        </div>
      )}
      {/* Responsible Agency for 1746 */}
      {serviceData.orgao_responsavel && (
        <div className="mb-6">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Órgão Responsável
          </h2>
          <p className="text-sm text-foreground-light leading-5">
            {serviceData.orgao_responsavel}
          </p>
        </div>
      )}
    </>
  )
}
