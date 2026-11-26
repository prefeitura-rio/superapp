'use client'

import { PILL_BUTTON_CLASS } from '@/components/cookie-consent'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { openCookiePreferences } from '@/lib/cookie-consent/browser'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface CookiePreferencesButtonProps {
  /**
   * - `link` (padrão): botão sem estilo próprio, para listas de links como o
   *   rodapé; o estilo vem de `className`.
   * - `button`: o mesmo botão em pílula do banner e do painel de cookies.
   */
  appearance?: 'link' | 'button'
  className?: string
  children?: ReactNode
}

/**
 * Abre o painel de preferências de cookies (montado pelo `CookieConsent` no
 * layout do app), para rever ou revogar a escolha a qualquer momento
 * (LGPD art. 8º, § 5º).
 */
export function CookiePreferencesButton({
  appearance = 'link',
  className,
  children = 'Preferências de cookies',
}: CookiePreferencesButtonProps) {
  if (appearance === 'button') {
    return (
      <CustomButton
        type="button"
        variant="primary"
        size="md"
        onClick={openCookiePreferences}
        className={cn(PILL_BUTTON_CLASS, className)}
      >
        {children}
      </CustomButton>
    )
  }

  return (
    <button
      type="button"
      onClick={openCookiePreferences}
      className={cn('cursor-pointer text-left', className)}
    >
      {children}
    </button>
  )
}
