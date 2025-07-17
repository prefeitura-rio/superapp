import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { applyEtapaRules } from '@/lib/content-rules'
import type { CariocaDigitalService } from '@/types/carioca-digital'
import Link from 'next/link'

interface CariocaDigitalServiceProps {
  serviceData: CariocaDigitalService
}

export function CariocaDigitalServiceComponent({
  serviceData,
}: CariocaDigitalServiceProps) {
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
      {serviceData.prazo_esperado && (
        <div className="mb-4">
          <h2 className="text-base font-medium text-foreground leading-5 mb-1">
            Prazo esperado
          </h2>
          <p className="text-sm text-foreground-light leading-5">
            {serviceData.prazo_esperado}
          </p>
        </div>
      )}

      {/* Service Cost */}
      {serviceData.custo_do_servico && (
        <div className="mb-6">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Custo do Serviço
          </h2>
          <p className="text-sm text-foreground-light leading-5">
            <Badge variant="secondary" className="text-xs capitalize bg-card">
              {serviceData.custo_do_servico}
            </Badge>
            {serviceData.valor_a_ser_pago && (
              <span className="block mt-1 font-medium">
                Valor: {serviceData.valor_a_ser_pago}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Access Service Button */}
      {serviceData.link_acesso && (
        <Button
          asChild
          variant="default"
          size="lg"
          className="mb-6 rounded-full"
        >
          <Link
            href={serviceData.link_acesso}
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

      {/* Detailed Documents */}
      {serviceData.documentos_detalhados &&
        serviceData.documentos_detalhados.length > 0 && (
          <div className="mb-6">
            <h2 className="text-base font-medium text-foreground leading-5 mb-2">
              Documentos
            </h2>
            <div className="space-y-3">
              {serviceData.documentos_detalhados.map((doc, index) => {
                // Check if permite_upload is an object with URL
                const documentUrl =
                  typeof doc.permite_upload === 'object' &&
                  doc.permite_upload?.url
                    ? doc.permite_upload.url
                    : doc.tem_url && doc.url
                      ? doc.url
                      : null

                return (
                  <div key={index}>
                    <div className="flex items-start gap-2">
                      <span className="text-sm text-foreground-light leading-5 font-medium mt-0.5">
                        •
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-foreground-light leading-5">
                          {doc.descricao}
                        </p>
                        {documentUrl && (
                          <Link
                            href={documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:text-primary/80 underline mt-2 inline-block"
                          >
                            Download/Acessar documento
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      {/* What this service doesn't cover */}
      {serviceData.este_servico_nao_cobre && (
        <div className="mb-6">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Este serviço não cobre
          </h2>
          <p className="text-sm text-foreground-light leading-5">
            {serviceData.este_servico_nao_cobre}
          </p>
        </div>
      )}

      {/* Special Procedures */}
      {serviceData.procedimentos_especiais && (
        <div className="mb-6">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Procedimentos Especiais
          </h2>
          <p className="text-sm text-foreground-light leading-5">
            {serviceData.procedimentos_especiais}
          </p>
        </div>
      )}

      {/* Detailed Steps */}
      {serviceData.etapas_detalhadas &&
        serviceData.etapas_detalhadas.length > 0 && (
          <div className="mb-6">
            <h2 className="text-base font-medium text-foreground leading-5 mb-2">
              Etapas
            </h2>
            <div className="space-y-2">
              {serviceData.etapas_detalhadas.map((etapa, index) => (
                <div key={index} className="rounded-lg">
                  <div className="flex items-start ">
                    {/* <span className="text-sm text-card-foreground leading-5 font-medium">
                      {etapa.ordem || index + 1}.
                    </span> */}
                    <div className="flex-1">
                      <p className="text-sm text-foreground-light leading-5">
                        {applyEtapaRules(etapa.descricao)}
                      </p>
                      {etapa.tem_link && etapa.link_solicitacao && (
                        <Button
                          asChild
                          variant="default"
                          size="lg"
                          className="mt-2 rounded-full"
                        >
                          <Link
                            href={etapa.link_solicitacao}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary inline-block"
                          >
                            Acesse aqui
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Legislation */}
      {serviceData.legislacao && serviceData.legislacao.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Legislação
          </h2>
          <ul className="space-y-1">
            {serviceData.legislacao.map((lei, index) => (
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

      {/* App Information */}
      {serviceData.disponivel_app && (
        <div className="mb-6">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Disponível em App
          </h2>
          <div className="space-y-2">
            <p className="text-sm text-foreground-light leading-5">
              Aplicativo 1746 Rio O Aplicativo 1746 conecta o cidadão à
              Prefeitura do Rio. Você poderá solicitar mais de mil tipos de
              informação e serviços públicos municipais, além de poder
              acompanhar o andamento das suas solicitações.
            </p>
            {serviceData.app_android && (
              <Link
                href="https://play.google.com/store/apps/details?id=br.com.datametrica.canal1746&hl=pt_BR"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:text-primary/80 underline block"
              >
                Download para Android
              </Link>
            )}
            {serviceData.app_ios && (
              <Link
                href={serviceData.app_ios}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:text-primary/80 underline block"
              >
                Download para iOS
              </Link>
            )}
          </div>
        </div>
      )}

      {/* In-Person Service */}
      {serviceData.atendimento_presencial && serviceData.local_presencial && (
        <div className="mb-6">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Atendimento Presencial
          </h2>
          <p className="text-sm text-foreground-light leading-5">
            {serviceData.local_presencial}
          </p>
        </div>
      )}

      {/* Responsible Agency for Carioca Digital */}
      {serviceData.orgao_gestor && (
        <div className="mb-6">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Órgão Gestor
          </h2>
          <p className="text-sm text-foreground-light leading-5">
            {serviceData.orgao_gestor}
          </p>
        </div>
      )}
    </>
  )
}
