'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function SessionExpiredHandler() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === '/session-expired') {
      const handleSessionExpiredLogout = async () => {
        try {
          // First logout from Keycloak
          await fetch('/api/auth/logout')

          // Then logout from gov.br via hidden iframe
          const redirectUri = `${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL}/auth?client_id=${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_REDIRECT_URI}&response_type=code`
          const govbrLogoutUrl = `${process.env.NEXT_PUBLIC_GOVBR_BASE_URL}logout?post_logout_redirect_uri=${encodeURIComponent(redirectUri)}`

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
