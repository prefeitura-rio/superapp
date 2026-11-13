import { FloatNavigationWrapper } from '@/app/components/float-navigation-wrapper'
import { ProfileHeaderWrapper } from '@/app/components/profile-header-wrapper'
import { listChamados } from '@/http-pref-rio-cidadao/default/default'
import { isSgrcHistoryMockEnabled } from '@/lib/feature-flags'
import { parseJsonBody } from '@/lib/parse-json-body'
import { IS_MOCK_ENABLED, MOCK_LIST } from '@/mocks/chamados'
import { OrigemChamados } from './components/origem-chamados'
import {
  filterTabFromParam,
  formatDate,
  mapCategoria,
  normalizeStatus,
} from './helpers'

export const revalidate = 0

interface MyRequestsPageProps {
  searchParams?: Promise<{ filtro?: string | string[] }>
}

export default async function MyRequestsPage({
  searchParams,
}: MyRequestsPageProps) {
  const filtroInicial = filterTabFromParam((await searchParams)?.filtro)
  const response = await listChamados()
  const apiData = parseJsonBody<{ protocolos?: any[] }>(response.data)

  const protocolos = [
    ...(response.status === 200 ? (apiData?.protocolos ?? []) : []),
    ...(IS_MOCK_ENABLED ? MOCK_LIST.protocolos : []),
  ]

  const items = protocolos.flatMap((protocolo: any) =>
    (protocolo.ordens_de_servico ?? []).map((os: any) => ({
      protocolo: protocolo.protocolo ?? '',
      codigoOs: os.codigoOs ?? '',
      servico: os.servico ?? os.subtema ?? '—',
      categoria: mapCategoria(os.categoria),
      status: normalizeStatus(os.status ?? protocolo.status),
      dataAbertura: formatDate(os.dataAbertura ?? protocolo.dataAbertura),
      isAcessoInformacao: os.isAcessoInformacao ?? false,
    }))
  )

  return (
    <div className="text-foreground">
      <ProfileHeaderWrapper />
      <div className="max-w-4xl mx-auto px-4 pb-4">
        <h1 className="text-3xl font-medium text-foreground pt-2 pb-2">
          Minhas Solicitações
        </h1>
        <OrigemChamados
          salesforce={items}
          historicoSgrc={isSgrcHistoryMockEnabled()}
          filtroInicial={filtroInicial}
        />
      </div>
      <FloatNavigationWrapper />
    </div>
  )
}
