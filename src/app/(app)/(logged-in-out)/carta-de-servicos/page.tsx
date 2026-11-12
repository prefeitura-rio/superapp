import HeaderWrapperClient from '@/app/components/header-wrapper-client'
import { CARTA_DE_SERVICOS_ROUTE } from '@/constants/carta-de-servicos'
import {
  type CartaOrgUnit,
  fetchCartaOrgUnits,
  formatOrgUnitLabel,
} from '@/lib/carta-servicos/org-units'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Lei13460Text } from './components/lei-13460-text'

export const revalidate = 600

export const metadata: Metadata = {
  title: 'Carta de serviços',
  description:
    'Carta de Serviços ao Usuário da Prefeitura do Rio, por órgão, conforme a Lei Federal nº 13.460/2017.',
}

async function loadOrgUnits(): Promise<CartaOrgUnit[] | null> {
  try {
    return await fetchCartaOrgUnits()
  } catch (error) {
    console.error('[carta-de-servicos] falha ao listar órgãos', error)
    return null
  }
}

export default async function CartaDeServicosPage() {
  const orgUnits = await loadOrgUnits()

  return (
    <div className="w-full bg-background text-foreground">
      <HeaderWrapperClient />
      <main className="w-full max-w-4xl mx-auto px-4 pb-10">
        <h1 className="pt-2 pb-2 text-3xl font-medium leading-9 tracking-tight text-primary">
          Carta de serviços
        </h1>

        <Lei13460Text />

        <section aria-labelledby="carta-orgaos-title" className="mt-6">
          <h2 id="carta-orgaos-title" className="sr-only">
            Órgãos e entidades
          </h2>

          {orgUnits === null && (
            <p className="rounded-2xl bg-card p-4 text-sm leading-5 text-foreground-light">
              Não foi possível carregar a lista de órgãos agora. Tente novamente
              em alguns minutos.
            </p>
          )}

          {orgUnits?.length === 0 && (
            <p className="rounded-2xl bg-card p-4 text-sm leading-5 text-foreground-light">
              Nenhum órgão com serviço publicado no momento.
            </p>
          )}

          {orgUnits && orgUnits.length > 0 && (
            <ul className="flex flex-col gap-2">
              {orgUnits.map(org => (
                <li key={org.siciCode}>
                  <Link
                    href={`${CARTA_DE_SERVICOS_ROUTE}/${encodeURIComponent(org.siciCode)}`}
                    className="flex w-full items-center rounded-2xl bg-card p-4 text-sm leading-5 text-foreground transition-colors hover:bg-secondary active:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {formatOrgUnitLabel(org)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
