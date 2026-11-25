'use client'

import { TICKET_FORM_BASE_URL } from '@/constants/url'
import { useInvalidateChamados } from '@/hooks/chamados/use-invalidate-chamados'
import {
  consumeFormularioMarker,
  markFormularioAberto,
} from '@/lib/chamados/formulario-marker'
import { useServerFeatureFlags } from '@/providers/server-feature-flags-provider'
import { useEffect } from 'react'

function originDe(url: string | undefined): string | null {
  if (!url) return null
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}

/**
 * Mantém o cache de chamados coerente com o formulário externo do 1746.
 *
 * O superapp não cria chamados: o cidadão sai para o formulário e volta. Um
 * listener delegado marca a ida (qualquer link para a origem do formulário, em
 * qualquer tela) e, quando a página volta a ficar visível (aba, foco ou
 * restauração do bfcache), o cache do Salesforce é invalidado.
 *
 * Numa carga completa da página (o caso comum de voltar na mesma aba) o cache
 * em memória já nasce vazio e o servidor traz dados novos; o marcador antigo é
 * só descartado.
 */
export function ChamadosCacheSync() {
  const { salesforce } = useServerFeatureFlags()
  const { invalidateSalesforce } = useInvalidateChamados()

  useEffect(() => {
    if (!salesforce) return

    // Contexto novo: os dados acabaram de vir do servidor.
    consumeFormularioMarker()

    const formOrigin = originDe(TICKET_FORM_BASE_URL)

    function aoClicar(event: MouseEvent) {
      if (!formOrigin) return
      const target = event.target
      if (!(target instanceof Element)) return
      const link = target.closest<HTMLAnchorElement>('a[href]')
      if (link && originDe(link.href) === formOrigin) markFormularioAberto()
    }

    function aoRetornar() {
      if (consumeFormularioMarker()) void invalidateSalesforce()
    }

    function aoMudarVisibilidade() {
      if (document.visibilityState === 'visible') aoRetornar()
    }

    function aoMostrarPagina(event: PageTransitionEvent) {
      if (event.persisted) aoRetornar()
    }

    // `auxclick`: clique do meio abre em outra aba sem disparar `click`.
    document.addEventListener('click', aoClicar, true)
    document.addEventListener('auxclick', aoClicar, true)
    document.addEventListener('visibilitychange', aoMudarVisibilidade)
    window.addEventListener('focus', aoRetornar)
    window.addEventListener('pageshow', aoMostrarPagina)
    return () => {
      document.removeEventListener('click', aoClicar, true)
      document.removeEventListener('auxclick', aoClicar, true)
      document.removeEventListener('visibilitychange', aoMudarVisibilidade)
      window.removeEventListener('focus', aoRetornar)
      window.removeEventListener('pageshow', aoMostrarPagina)
    }
  }, [salesforce, invalidateSalesforce])

  return null
}
