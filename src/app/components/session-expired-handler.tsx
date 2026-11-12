'use client'

import { buildGovbrLogoutUrl } from '@/lib/govbr-logout'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function SessionExpiredHandler() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === '/sessao-expirada') {
      const handleSessionExpiredLogout = async () => {
        try {
          // First logout from Keycloak
          await fetch('/api/auth/logout')

          // Then logout from gov.br via hidden iframe
          const govbrLogoutUrl = buildGovbrLogoutUrl()
          if (!govbrLogoutUrl) return

          const iframe = document.createElement('iframe')
          iframe.style.display = 'none'
          iframe.src = govbrLogoutUrl
          document.body.appendChild(iframe)

          // Remove the iframe after loading
          iframe.onload = () => {
            setTimeout(() => {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe)
              }
            }, 0)
          }
        } catch (error) {
          console.error('Error during session expired logout:', error)
        }
      }

      handleSessionExpiredLogout()
    }
  }, [pathname])

  return null
}
