import { FloatNavigationWrapper } from '@/app/components/float-navigation-wrapper'
import { ProfileHeaderWrapper } from '@/app/components/profile-header-wrapper'
import { chamadosSalesforceQueryOptions } from '@/hooks/chamados/chamados-query-options'
import { FORMULARIO_MARKER_COOKIE } from '@/lib/chamados/formulario-marker'
import { fetchChamadosSalesforceNoServidor } from '@/lib/chamados/server-fetchers'
import { isSgrcHistoricoEnabled } from '@/lib/feature-flags'
import { getServerQueryClient } from '@/lib/query/get-server-query-client'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { cookies } from 'next/headers'
import { Suspense } from 'react'
import { OrigemChamados } from './components/origem-chamados'
import { SalesforceLista } from './components/salesforce-lista'
import { SolicitacoesBreadcrumb } from './components/solicitacoes-breadcrumb'
import { filterTabFromParam } from './helpers'
import { ORIGEM_PARAM, resolveOrigemInicial } from './origem'

export const revalidate = 0

interface MyRequestsPageProps {
  searchParams?: Promise<{
    filtro?: string | string[]
    [ORIGEM_PARAM]?: string | string[]
  }>
}

export default async function MyRequestsPage({
  searchParams,
}: MyRequestsPageProps) {
  const params = await searchParams
  const filtroInicial = filterTabFromParam(params?.filtro)
  const sgrcHistorico = isSgrcHistoricoEnabled()
  const origemInicial = resolveOrigemInicial(
    params?.[ORIGEM_PARAM],
    (await cookies()).get(FORMULARIO_MARKER_COOKIE)?.value
  )

  // O servidor só faz o prefetch: quem renderiza e revalida a lista é o client
  // (TanStack Query), na mesma query key do banner da home.
  const queryClient = getServerQueryClient()
  const prefetch = queryClient.prefetchQuery({
    ...chamadosSalesforceQueryOptions(),
    queryFn: fetchChamadosSalesforceNoServidor,
  })
  // Espera o dado (ele já vem no HTML) quando a lista do Salesforce é a que
  // aparece primeiro: única da tela, ou origem pedida. Como segunda origem, ela
  // segue por streaming sem atrasar a primeira resposta.
  if (!sgrcHistorico || origemInicial === 'salesforce') await prefetch

  return (
    <div className="text-foreground">
      <ProfileHeaderWrapper />
      <Suspense>
        <SolicitacoesBreadcrumb />
      </Suspense>
      <div className="max-w-4xl mx-auto px-4 pb-4">
        <h1 className="text-3xl font-medium text-foreground pt-2 pb-2">
          Minhas Solicitações
        </h1>
        <HydrationBoundary state={dehydrate(queryClient)}>
          {/* Sem FEATURE_SGRC_HISTORICO, só os chamados do Salesforce, sem o
              seletor "Data de abertura". */}
          {sgrcHistorico ? (
            <OrigemChamados
              filtroInicial={filtroInicial}
              origemInicial={origemInicial}
            />
          ) : (
            <SalesforceLista filtroInicial={filtroInicial} />
          )}
        </HydrationBoundary>
      </div>
      <FloatNavigationWrapper />
    </div>
  )
}
