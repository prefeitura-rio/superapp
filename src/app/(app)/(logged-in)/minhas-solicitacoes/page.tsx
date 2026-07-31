import { FloatNavigationWrapper } from '@/app/components/float-navigation-wrapper'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { listChamados } from '@/http-pref-rio-cidadao/default/default'
import { RequestsList } from './components/requests-list'
import { formatDate, normalizeStatus } from './helpers'

export const revalidate = 0

export default async function MyRequestsPage() {
  const response = await listChamados()

  const rawData =
    typeof response.data === 'string'
      ? JSON.parse(response.data)
      : response.data

  const items =
    response.status === 200 && rawData?.protocolos
      ? rawData.protocolos.flatMap((protocolo: any) =>
          (protocolo.ordens_de_servico ?? []).map((os: any) => ({
            protocolo: protocolo.protocolo ?? '',
            codigoOs: os.codigoOs ?? '',
            servico: os.servico ?? os.categoria ?? '—',
            categoria: os.categoria ?? 'Serviços',
            status: normalizeStatus(os.status ?? protocolo.status),
            dataAbertura: formatDate(os.dataAbertura ?? protocolo.dataAbertura),
          }))
        )
      : []

  return (
    <div className="max-w-4xl min-h-lvh mx-auto text-foreground">
      <SecondaryHeader title="Minhas Solicitações" route="/" />
      <RequestsList items={items} />
      <FloatNavigationWrapper />
    </div>
  )
}
