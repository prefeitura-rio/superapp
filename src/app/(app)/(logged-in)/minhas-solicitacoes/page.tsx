import { FloatNavigationWrapper } from '@/app/components/float-navigation-wrapper'
import { SecondaryHeader } from '@/app/components/secondary-header'
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
    }))
  )

  return (
    <div className="max-w-4xl min-h-lvh mx-auto text-foreground">
      <SecondaryHeader
        route="/"
        style={{ paddingTop: '24px', paddingBottom: '24px' }}
        logo={
          <span
            style={{
              color: 'var(--theme-color-foreground, #09090B)',
              fontFamily: 'var(--font-family-sans, "DM Sans")',
              fontSize: 'var(--font-size-lg, 18px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              lineHeight: 'var(--font-leading-5, 20px)',
              letterSpacing: 'var(--font-tracking-normal, 0)',
              textAlign: 'center',
            }}
          >
            Minhas Solicitações
          </span>
        }
      />
      <RequestsList items={items} />
      <FloatNavigationWrapper />
    </div>
  )
}
