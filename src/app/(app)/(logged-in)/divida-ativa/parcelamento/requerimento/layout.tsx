import { DocumentosRequerimentoProvider } from '@/app/components/divida-ativa/documentos-requerimento-context'

/**
 * Layout do wizard de requerimento: guarda os anexos em memória entre as etapas, e os
 * descarta quando o cidadão sai do fluxo. Ver `DocumentosRequerimentoProvider`.
 */
export default function RequerimentoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DocumentosRequerimentoProvider>{children}</DocumentosRequerimentoProvider>
  )
}
