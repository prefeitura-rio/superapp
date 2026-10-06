import { FloatNavigationWrapper } from '@/app/components/float-navigation-wrapper'
import { ProfileHeaderWrapper } from '@/app/components/profile-header-wrapper'
import { listChamados } from '@/http-pref-rio-cidadao/default/default'
import { IS_MOCK_ENABLED, MOCK_LIST } from '@/mocks/chamados'
import { RequestsList } from './components/requests-list'
import { formatDate, mapCategoria, normalizeStatus } from './helpers'

export const revalidate = 0

export default async function MyRequestsPage() {
  const response = await listChamados()
  const apiData =
    typeof response.data === 'string'
      ? JSON.parse(response.data)
      : response.data

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
      <div className="max-w-4xl mx-auto px-4 pb-10">
        <h1 className="text-3xl font-medium text-foreground pt-2 pb-2">
          Minhas Solicitações
        </h1>
        <RequestsList items={items} />
      </div>
      <FloatNavigationWrapper />
    </div>
  )
}
