'use client'

import {
  FOOTER_EXCLUDED_PATTERNS,
  FOOTER_EXCLUDED_ROUTES,
} from '@/constants/footer-excluded-routes'
import { usePathname } from 'next/navigation'
import { Footer } from './footer'

export function FooterWrapper() {
  const pathname = usePathname()
  const isExcluded =
    FOOTER_EXCLUDED_ROUTES.some(route => pathname.startsWith(route)) ||
    FOOTER_EXCLUDED_PATTERNS.some(pattern => pattern.test(pathname))
  if (isExcluded) return null
  return <Footer />
}
