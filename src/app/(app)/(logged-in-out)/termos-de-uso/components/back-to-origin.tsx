'use client'

import { ChevronLeftIcon } from '@/assets/icons'
import { useRouter } from 'next/navigation'
import { hasSameOriginReferrer } from './back-button'
import { BACK_CONTROL_CLASSNAME } from './back-link'

interface BackToOriginProps {
  /** Tela de origem, usada quando não dá para voltar nem fechar a aba. */
  href: string
  label: string
}

/** Tempo para o navegador fechar a aba antes de cairmos no fallback. */
const CLOSE_FALLBACK_MS = 200

/**
 * Voltar para a tela que abriu os termos (ex.: o currículo), sem perder o que
 * a pessoa preencheu lá:
 * - chegou na mesma aba: volta no histórico;
 * - a aba foi aberta só para os termos (link em nova aba): fecha a aba e a
 *   pessoa volta à aba de origem, intacta;
 * - o navegador não deixou fechar: navega para a tela de origem.
 */
export function BackToOrigin({ href, label }: BackToOriginProps) {
  const router = useRouter()

  function handleBack() {
    if (window.history.length > 1 && hasSameOriginReferrer()) {
      router.back()
      return
    }
    window.close()
    window.setTimeout(() => {
      if (!window.closed) router.push(href)
    }, CLOSE_FALLBACK_MS)
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={label}
      className={BACK_CONTROL_CLASSNAME}
    >
      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
    </button>
  )
}
