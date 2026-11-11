import HeaderWrapperClient from '@/app/components/header-wrapper-client'
import { ArrowUpRight } from '@/assets/icons/arrow-up-right'
import {
  cartaPdfFileName,
  cartaPdfHref,
  cartaServiceHref,
  fetchCartaOrgUnit,
  fetchCartaOrgUnitServices,
  formatOrgUnitLabel,
  isValidSiciCode,
} from '@/lib/carta-servicos/org-units'
import { isSalesforceServicesEnabled } from '@/lib/feature-flags'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DownloadCartaButton } from '../components/download-carta-button'

export const revalidate = 600

type Params = Promise<{ siciCode: string }>

async function loadOrg(siciCode: string) {
  if (!isValidSiciCode(siciCode)) return null
  return fetchCartaOrgUnit(siciCode)
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { siciCode } = await params
  const org = await loadOrg(siciCode).catch(() => null)
  return {
    title: org
      ? `Carta de serviços - ${formatOrgUnitLabel(org)}`
      : 'Carta de serviços',
  }
}

export default async function CartaDeServicosOrgaoPage({
  params,
}: {
  params: Params
}) {
  const { siciCode } = await params
  const org = await loadOrg(siciCode)
  if (!org) notFound()

  const services = await fetchCartaOrgUnitServices(org.siciCode)

  return (
    <div className="w-full bg-background text-foreground">
      <HeaderWrapperClient />
      <main className="w-full max-w-4xl mx-auto px-4 pb-10">
        <h1 className="pt-2 pb-6 text-3xl font-medium leading-9 tracking-tight text-primary">
          {formatOrgUnitLabel(org)}
        </h1>

        <DownloadCartaButton
          href={cartaPdfHref(org.siciCode)}
          fileName={cartaPdfFileName(org)}
        />

        <section aria-labelledby="carta-servicos-title" className="mt-6">
          <h2 id="carta-servicos-title" className="sr-only">
            Serviços do órgão
          </h2>
          <ul className="flex flex-col gap-2">
            {services.map(service => {
              // A tela do serviço só resolve slugs da app-catalogo com a flag ligada;
              // com ela desligada (busca-search, outros slugs) o link daria 404.
              const href = isSalesforceServicesEnabled()
                ? cartaServiceHref(service)
                : null
              const key = service.slug ?? service.articleId ?? service.name
              const className =
                'flex w-full items-center justify-between gap-4 rounded-2xl bg-card p-4 text-sm leading-5 text-foreground'

              return (
                <li key={key}>
                  {href ? (
                    <Link
                      href={href}
                      className={`${className} transition-colors hover:bg-secondary active:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                    >
                      <span>{service.name}</span>
                      <ArrowUpRight
                        className="h-6 w-6 shrink-0 text-foreground"
                        aria-hidden
                      />
                    </Link>
                  ) : (
                    <div className={className}>{service.name}</div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      </main>
    </div>
  )
}
