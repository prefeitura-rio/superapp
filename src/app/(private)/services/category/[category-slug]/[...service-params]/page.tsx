import { SecondaryHeader } from '@/app/(private)/components/secondary-header'
import { fetchServiceById, getCategoryNameBySlug } from '@/lib/services-utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function ServicePage({
  params,
}: {
  params: Promise<{ 'category-slug': string; 'service-params': string[] }>
}) {
  const { 'category-slug': categorySlug, 'service-params': serviceParams } =
    await params

  // Extract service ID and collection from params
  const [serviceId, collection] = serviceParams

  if (!serviceId || !collection) {
    notFound()
  }

  // Fetch the service data
  const serviceData = await fetchServiceById(collection, serviceId)

  if (!serviceData) {
    notFound()
  }

  const categoryName = getCategoryNameBySlug(categorySlug)

  return (
    <div className="min-h-lvh max-w-md mx-auto flex flex-col">
      <SecondaryHeader title="Descrição do Serviço" />
      <div className="min-h-screen text-white">
        <div className="max-w-md mx-auto pt-20 px-4 pb-20">
          <div className="space-y-6">
            {/* Service Header */}
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-card-foreground">
                {serviceData.titulo}
              </h1>
              <p className="text-sm text-muted-foreground">
                <strong>Categoria:</strong> {categoryName}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Órgão:</strong> {serviceData.orgao_responsavel}
              </p>
            </div>

            {/* Service Description */}
            <div className="bg-card p-4 rounded-lg">
              <h2 className="font-semibold mb-2 text-card-foreground">
                Descrição
              </h2>
              <p className="text-card-foreground text-sm">
                {serviceData.descricao}
              </p>
            </div>

            {/* How to Request */}
            {serviceData.como_solicitar && (
              <div className="bg-card p-4 rounded-lg">
                <h2 className="font-semibold mb-2 text-card-foreground">
                  Como Solicitar
                </h2>
                <p className="text-card-foreground text-sm">
                  {serviceData.como_solicitar}
                </p>
              </div>
            )}

            {/* Service Details */}
            <div className="bg-card p-4 rounded-lg">
              <h2 className="font-semibold mb-3 text-card-foreground">
                Detalhes do Serviço
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Custo:</span>
                  <span className="text-card-foreground capitalize">
                    {serviceData.custo_servico}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Complexidade:</span>
                  <span className="text-card-foreground capitalize">
                    {serviceData.complexidade}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Urgência:</span>
                  <span className="text-card-foreground capitalize">
                    {serviceData.urgencia}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Público Alvo:</span>
                  <span className="text-card-foreground capitalize">
                    {serviceData.publico_alvo}
                  </span>
                </div>
                {serviceData.prazo_execucao && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prazo:</span>
                    <span className="text-card-foreground">
                      {serviceData.prazo_execucao}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* What doesn't serve */}
            {serviceData.o_que_nao_atende && (
              <div className="bg-card p-4 rounded-lg">
                <h2 className="font-semibold mb-2 text-card-foreground">
                  O que não atende
                </h2>
                <p className="text-card-foreground text-sm">
                  {serviceData.o_que_nao_atende}
                </p>
              </div>
            )}

            {/* Requirements */}
            {serviceData.requisitos && (
              <div className="bg-card p-4 rounded-lg">
                <h2 className="font-semibold mb-2 text-card-foreground">
                  Requisitos
                </h2>
                <p className="text-card-foreground text-sm">
                  {serviceData.requisitos}
                </p>
              </div>
            )}

            {/* Keywords */}
            {serviceData.palavras_chave &&
              serviceData.palavras_chave.length > 0 && (
                <div className="bg-card p-4 rounded-lg">
                  <h2 className="font-semibold mb-2 text-card-foreground">
                    Palavras-chave
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {serviceData.palavras_chave.map((keyword, index) => (
                      <span
                        key={index}
                        className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* External Link */}
            {serviceData.url && (
              <div className="bg-card p-4 rounded-lg">
                <h2 className="font-semibold mb-2 text-card-foreground">
                  Link Oficial
                </h2>
                <Link
                  href={serviceData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  Acessar página oficial do serviço
                </Link>
              </div>
            )}

            {/* Related Links */}
            {serviceData.link_relacionados &&
              serviceData.link_relacionados.length > 0 && (
                <div className="bg-card p-4 rounded-lg">
                  <h2 className="font-semibold mb-2 text-card-foreground">
                    Links Relacionados
                  </h2>
                  <div className="space-y-1">
                    {serviceData.link_relacionados.map((link, index) => (
                      <Link
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm block"
                      >
                        {link}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}
