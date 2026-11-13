'use client'

import { ChevronLeftIcon } from '@/assets/icons'
import { useRouter } from 'next/navigation'
import { BACK_CONTROL_CLASSNAME } from './back-link'

interface BackButtonProps {
  /** Destino quando não há página anterior do próprio site no histórico. */
  fallbackHref: string
}

/**
 * Voltar do handoff, abaixo do Header Global (que ocupa a esquerda com a logo).
 * Estado focused no hover (desktop) e enquanto pressionado (mobile).
 */
export function BackButton({ fallbackHref }: BackButtonProps) {
  const router = useRouter()

  function handleBack() {
    if (hasSameOriginReferrer()) {
      router.back()
      return
    }
    router.push(fallbackHref)
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label="Voltar"
      className={BACK_CONTROL_CLASSNAME}
    >
      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
    </button>
  )
}

/**
 * Acesso direto (link externo, nova aba) não tem para onde voltar dentro do
 * app; nesse caso o botão leva ao fallback em vez de sair do site.
 */
export function hasSameOriginReferrer() {
  if (window.history.length <= 1 || !document.referrer) return false
  try {
    return new URL(document.referrer).origin === window.location.origin
  } catch {
    return false
  }
}
