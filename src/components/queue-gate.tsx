'use client'

import Script from 'next/script'

interface QueueGateProps {
  /** ID do cliente no rio-queue (ex: "prefeiturario") */
  customer: string
  /** ID da fila (ex: "superapp") */
  queue: string
  /**
   * URL onde rio-queue.min.js está hospedado.
   * Em produção: NEXT_PUBLIC_RIO_QUEUE_URL (bucket GCS).
   */
  scriptUrl: string
  /**
   * URL base da API do rio-queue (backend).
   * Em produção: NEXT_PUBLIC_RIO_QUEUE_API_URL (ex: https://rio-queue.dados.rio).
   * Usado como data-queueit-url — é para onde queueclient faz as chamadas de API.
   */
  apiUrl: string
}

export function QueueGate({ customer, queue, scriptUrl, apiUrl }: QueueGateProps) {
  if (!scriptUrl || !apiUrl) return null

  return (
    <Script
      src={`${scriptUrl}/rio-queue.min.js`}
      data-queueit-c={customer}
      data-queueit-e={queue}
      data-queueit-url={apiUrl}
      strategy="afterInteractive"
    />
  )
}
