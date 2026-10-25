'use client'

import { PageClientWrapper } from '@/app/(app)/(logged-in-out)/servicos/categoria/[category-slug]/[...service-params]/(service-detail)/page-client-wrapper'
import HeaderWrapperClient from '@/app/components/header-wrapper-client'
import { OfficialBanner } from '@/app/components/service'
import {
  PREVIEW_READY_RETRY_MS,
  PREVIEW_READY_TIMEOUT_MS,
  PREVIEW_READY_TYPE,
  type PreviewErrorCode,
  isPreviewDataMessage,
  previewErrorMessage,
  readPreviewNonce,
} from '@/lib/carta-servicos/preview-protocol'
import type { ServicePreviewResponse } from '@/lib/carta-servicos/preview-service'
import { useEffect, useRef, useState } from 'react'

type PreviewPhase =
  | 'waiting'
  | 'loading'
  | 'ready'
  | 'empty'
  | 'misconfigured'
  | 'error'

interface PreviewClientProps {
  allowedOrigins: string[]
}

export function PreviewClient({ allowedOrigins }: PreviewClientProps) {
  const [phase, setPhase] = useState<PreviewPhase>('waiting')
  const [preview, setPreview] = useState<ServicePreviewResponse | null>(null)
  const requestId = useRef(0)
  const nonceRef = useRef<string | null>(null)
  const originsKey = allowedOrigins.join('\n')

  useEffect(() => {
    const origins = originsKey ? originsKey.split('\n') : []
    let stopReady = false
    let interval = 0
    let timeout = 0

    const detachOpener = () => {
      try {
        window.opener = null
      } catch {
        // Cross-origin opener can reject the assignment.
      }
    }

    const stopPinging = () => {
      stopReady = true
      window.clearInterval(interval)
      window.clearTimeout(timeout)
    }

    const sendReady = () => {
      const nonce = nonceRef.current
      if (stopReady || !nonce || !window.opener) return
      const message = { type: PREVIEW_READY_TYPE, nonce }
      for (const origin of origins) {
        window.opener.postMessage(message, origin)
      }
    }

    const postTimeout = () => {
      const nonce = nonceRef.current
      if (!nonce || !window.opener) return
      const message = previewErrorMessage(nonce, 'timeout')
      for (const origin of origins) {
        window.opener.postMessage(message, origin)
      }
    }

    const replyError = (
      event: MessageEvent,
      nonce: string,
      code: PreviewErrorCode
    ) => {
      const source = event.source
      if (source instanceof Window) {
        source.postMessage(previewErrorMessage(nonce, code), event.origin)
        return
      }
      if (!window.opener) return
      window.opener.postMessage(previewErrorMessage(nonce, code), event.origin)
    }

    const loadPreview = async (payload: unknown, event: MessageEvent) => {
      const nonce = nonceRef.current
      const id = ++requestId.current
      setPhase(current => (current === 'ready' ? current : 'loading'))

      try {
        const response = await fetch('/api/preview/servicos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          cache: 'no-store',
        })

        if (id !== requestId.current || !nonce) return

        if (!response.ok) {
          const code: PreviewErrorCode =
            response.status === 413
              ? 'payload_too_large'
              : response.status === 429
                ? 'rate_limited'
                : 'invalid_payload'
          replyError(event, nonce, code)
          detachOpener()
          setPhase('error')
          return
        }

        const data = (await response.json()) as ServicePreviewResponse
        if (id !== requestId.current) return

        setPreview(data)
        setPhase('ready')
        detachOpener()
      } catch {
        if (id !== requestId.current || !nonce) return
        replyError(event, nonce, 'invalid_payload')
        detachOpener()
        setPhase('error')
      }
    }

    const armTimeout = () => {
      window.clearTimeout(timeout)
      timeout = window.setTimeout(() => {
        stopPinging()
        postTimeout()
        detachOpener()
        setPhase(current => (current === 'waiting' ? 'empty' : current))
      }, PREVIEW_READY_TIMEOUT_MS)
    }

    const begin = () => {
      stopPinging()
      stopReady = false
      requestId.current += 1
      const nonce = readPreviewNonce(window.location.hash)
      nonceRef.current = nonce

      if (!window.opener && !nonce) {
        setPhase('empty')
        return
      }
      if (origins.length === 0) {
        setPhase(current => (current === 'ready' ? current : 'misconfigured'))
        return
      }
      if (!nonce) {
        setPhase(current => (current === 'ready' ? current : 'empty'))
        return
      }

      setPhase(current => (current === 'ready' ? current : 'waiting'))
      if (!window.opener) return

      sendReady()
      interval = window.setInterval(sendReady, PREVIEW_READY_RETRY_MS)
      armTimeout()
    }

    const onMessage = (event: MessageEvent) => {
      if (!origins.includes(event.origin)) return
      if (!isPreviewDataMessage(event.data)) return
      if (event.data.nonce !== nonceRef.current) return

      stopPinging()
      void loadPreview(event.data.payload, event)
    }

    window.addEventListener('hashchange', begin)
    window.addEventListener('message', onMessage)
    begin()

    return () => {
      stopPinging()
      window.removeEventListener('hashchange', begin)
      window.removeEventListener('message', onMessage)
    }
  }, [originsKey])

  return (
    <>
      <div
        role="status"
        className="bg-foreground text-background text-center text-sm leading-5 px-4 py-2"
      >
        Pré-visualização — este serviço não está publicado
      </div>

      {phase === 'ready' && preview ? (
        <PageClientWrapper
          serviceData={preview.service}
          orgaoGestorName={preview.orgaoGestorName}
          categorySlug={preview.categorySlug}
          contentFormat="html"
          ticketFlags={preview.ticketFlags}
          isPreview
        />
      ) : (
        <PreviewShell>
          <p className="text-sm text-foreground-light leading-5">
            {messageFor(phase)}
          </p>
        </PreviewShell>
      )}
    </>
  )
}

function messageFor(phase: PreviewPhase): string {
  if (phase === 'loading' || phase === 'waiting') {
    return 'Carregando pré-visualização…'
  }
  if (phase === 'misconfigured') {
    return 'A pré-visualização não está configurada neste ambiente.'
  }
  if (phase === 'error') {
    return 'Não foi possível montar a pré-visualização. Confira os dados do serviço e tente de novo.'
  }
  return 'Abra esta página pelo botão de pré-visualização na Salesforce.'
}

function PreviewShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OfficialBanner />
      <div className="max-w-4xl mx-auto">
        <HeaderWrapperClient />
        <div className="pb-20 px-4">{children}</div>
      </div>
    </>
  )
}
