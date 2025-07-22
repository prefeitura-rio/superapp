import androidIcon from '@/assets/android_button.png'
import iosIcon from '@/assets/ios_button.png'
import { Button } from '@/components/ui/button'
import { applyEtapaRules } from '@/lib/content-rules'
import { convertUrlsToLinks } from '@/lib/url-utils'
import type { CariocaDigitalService } from '@/types/carioca-digital'
import Link from 'next/link'
import { CollapsibleText } from './collapsible-text'

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
      <p className="text-sm text-foreground-light leading-5 mb-6 max-w-md">
        {serviceData.descricao}
      </p>

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

      {/* Expected Timeframe Section */}
      {serviceData.prazo_esperado && (
        <div className="mb-4">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Prazo
          </h2>
          <p className="text-sm text-foreground-light leading-5">
            {serviceData.prazo_esperado}
          </p>
        </div>
      )}

      {/* Service Cost */}
      {(serviceData.custo_do_servico || serviceData.valor_a_ser_pago) && (
        <div className="mb-4">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Custo
          </h2>
          <p className="text-sm text-foreground-light leading-5 capitalize">
            {serviceData.custo_do_servico}
            {serviceData.valor_a_ser_pago && (
              <span className="block mt-2">
                Valor: {convertUrlsToLinks(serviceData.valor_a_ser_pago)}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Detailed Steps */}
      {serviceData.etapas_detalhadas &&
        serviceData.etapas_detalhadas.length > 0 && (
          <div className="mb-4">
            <h2 className="text-base font-medium text-foreground leading-5 mb-2">
              Como solicitar
            </h2>
            <div className="space-y-1">
              {serviceData.etapas_detalhadas.map((etapa, index) => (
                <div key={index} className="rounded-lg">
                  <div className="flex items-start ">
                    {/* <span className="text-sm text-card-foreground leading-5 font-medium">
                      {etapa.ordem || index + 1}.
                    </span> */}
                    <div className="flex flex-col items-start gap-2">
                      <p className="text-sm text-foreground-light leading-5">
                        {convertUrlsToLinks(applyEtapaRules(etapa.descricao))}
                      </p>
                      {etapa.tem_link && etapa.link_solicitacao && (
                        <Button
                          asChild
                          variant="default"
                          size="lg"
                          className="rounded-full my-2"
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

      {/* Detailed Documents */}
      {serviceData.documentos_detalhados &&
        serviceData.documentos_detalhados.length > 0 && (
          <div className="mb-4">
            <h2 className="text-base font-medium text-foreground leading-5 mb-2">
              Documentos
            </h2>
            <div className="space-y-1">
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
                      <span className="text-sm text-foreground-light leading-5 font-medium ">
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

      {/* Special Procedures */}
      {serviceData.procedimentos_especiais && (
        <div className="mb-4">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Documentação para casos especiais
          </h2>
          <p className="text-sm text-foreground-light leading-5">
            {serviceData.procedimentos_especiais}
          </p>
        </div>
      )}

      {/* What this service doesn't cover */}
      {serviceData.este_servico_nao_cobre && (
        <div className="mb-4">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Este serviço não cobre
          </h2>
          <CollapsibleText text={serviceData.este_servico_nao_cobre} />
        </div>
      )}

      {/* Additional Information */}
      {(serviceData.informacoes_complementares ||
        serviceData.horario_funcionamento ||
        serviceData.como_orgao_atua) && (
        <div className="mb-4">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Descrição
          </h2>
          {serviceData.informacoes_complementares && (
            <CollapsibleText text={serviceData.informacoes_complementares} />
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

      {/* Legislation */}
      {serviceData.legislacao && serviceData.legislacao.length > 0 && (
        <div className="mb-4">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Legislação
          </h2>
          <ul className="space-y-1">
            {serviceData.legislacao.map((lei, index) => (
              <li
                key={index}
                className="text-sm text-foreground-light leading-5"
              >
                {lei}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* App Information */}
      {serviceData.disponivel_app && (
        <div className="mb-6">
          <h2 className="text-base font-medium text-foreground leading-5 mb-2">
            Baixar
          </h2>
          <div className="space-y-2">
            <p className="text-sm text-foreground-light leading-5 pb-2">
              Aplicativo 1746 Rio O Aplicativo 1746 conecta o cidadão à
              Prefeitura do Rio. Você poderá solicitar mais de mil tipos de
              informação e serviços públicos municipais, além de poder
              acompanhar o andamento das suas solicitações.
            </p>
            <div className="flex flex-col gap-2">
              {serviceData.app_android && (
                <div className="inline-block">
                  <Link
                    href={
                      serviceData.app_android ??
                      'https://play.google.com/store/apps/details?id=br.com.datametrica.canal1746&hl=pt_BR'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block hover:opacity-80 transition-opacity"
                  >
                    <img src={androidIcon.src} alt="Download para Android" />
                  </Link>
                </div>
              )}
              {serviceData.app_ios && (
                <div className="inline-block">
                  <Link
                    href={serviceData.app_ios}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block hover:opacity-80 transition-opacity"
                  >
                    <img src={iosIcon.src} alt="Download para iOS" />
                  </Link>
                </div>
              )}
            </div>
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
