'use client'

import {
  FOOTER_EXCLUDED_PATTERNS,
  FOOTER_EXCLUDED_ROUTES,
} from '@/constants/footer-excluded-routes'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/**
 * Decide se exibe o footer com base na rota atual.
 *
 * Recebe o footer pré-renderizado como `children` para seguir o composition
 * pattern do App Router: o RSC assíncrono (Footer) é resolvido no servidor
 * pelo layout e passado já pronto; o Client Component não precisa renderizá-lo
 * diretamente, evitando o erro "suspended by an uncached promise".
 */
export function FooterWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isExcluded =
    FOOTER_EXCLUDED_ROUTES.some(route => pathname.startsWith(route)) ||
    FOOTER_EXCLUDED_PATTERNS.some(pattern => pattern.test(pathname))
  if (isExcluded) return null
  return <>{children}</>
}
