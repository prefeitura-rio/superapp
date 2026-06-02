'use client'

import Script from 'next/script'

interface QueueGateProps {
  /** ID do cliente no rio-queue (ex: "prefeiturario") */
  customer: string
  /** ID da fila (ex: "nfse-emissao") */
  queue: string
  /** URL base do rio-queue */
  apiUrl: string
}

/**
 * Coloca a página atual atrás da fila do rio-queue.
 * Adicione no topo da page.tsx do serviço que precisa de controle de acesso.
 * A prop `apiUrl` deve vir de `process.env.NEXT_PUBLIC_RIO_QUEUE_URL` no
 * server component pai (mesmo padrão do HandTalkPlugin).
 *
 * @example
 * // app/servicos/nfse/emissao/page.tsx  (server component)
 * import { QueueGate } from '@/components/queue-gate'
 *
 * export default function Page() {
 *   return (
 *     <>
 *       <QueueGate
 *         customer="prefeiturario"
 *         queue="nfse-emissao"
 *         apiUrl={process.env.NEXT_PUBLIC_RIO_QUEUE_URL ?? ''}
 *       />
 *       // ...conteúdo da página
 *     </>
 *   )
 * }
 */
export function QueueGate({ customer, queue, apiUrl }: QueueGateProps) {
  if (!apiUrl) return null

  return (
    <Script
      src={`${apiUrl}/rio-queue.min.js`}
      data-queueit-c={customer}
      data-queueit-e={queue}
      data-queueit-url={apiUrl}
      strategy="afterInteractive"
    />
  )
}
