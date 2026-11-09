'use client'

import { ChevronLeftIcon } from '@/assets/icons'
import { useRouter } from 'next/navigation'

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
      className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-foreground transition-colors hover:bg-secondary active:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
    </button>
  )
}

/**
 * Acesso direto (link externo, nova aba) não tem para onde voltar dentro do
 * app; nesse caso o botão leva ao fallback em vez de sair do site.
 */
function hasSameOriginReferrer() {
  if (window.history.length <= 1 || !document.referrer) return false
  try {
    return new URL(document.referrer).origin === window.location.origin
  } catch {
    return false
  }
}
