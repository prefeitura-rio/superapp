'use client'

import { build1746LogoutUrl } from '@/lib/1746-logout'
import { buildGovbrLogoutUrl } from '@/lib/govbr-logout'
import { isGoogleChrome } from '@/lib/is-google-chrome'
import { getQueryClient } from '@/lib/query/query-client'
import { useCallback, useState } from 'react'

/** Tempo máximo esperando o logout em segundo plano (1746 e Gov.br). */
const BACKGROUND_LOGOUT_TIMEOUT_MS = 5000

/** Navegação de topo final no Google Chrome: Keycloak → home. */
const SSO_LOGOUT_ROUTE = '/api/auth/sso-logout'

/**
 * Navegação de topo final nos outros navegadores: Keycloak → logout do Gov.br.
 * O usuário termina no Gov.br, deslogado (ver `@/lib/govbr-logout`).
 */
const SSO_LOGOUT_GOVBR_ROUTE = '/api/auth/sso-logout/govbr'

/**
 * `AbortSignal` que dispara depois de `ms`. `AbortSignal.timeout` só existe a
 * partir do Safari 16 (iOS 16); sem ele, a chamada lançaria `TypeError` e o
 * logout do 1746 seria pulado sem aviso nesses aparelhos.
 */
function timeoutSignal(ms: number): AbortSignal {
  if (typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(ms)
  }
  const controller = new AbortController()
  setTimeout(() => controller.abort(), ms)
  return controller.signal
}

/**
 * Encerra a sessão do 1746 em segundo plano. A resposta é opaca (`no-cors`);
 * basta o Salesforce receber a requisição com o cookie `sid`.
 */
async function logoutFrom1746(): Promise<void> {
  const url = build1746LogoutUrl()
  if (!url) return

  try {
    await fetch(url, {
      mode: 'no-cors',
      credentials: 'include',
      cache: 'no-store',
      signal: timeoutSignal(BACKGROUND_LOGOUT_TIMEOUT_MS),
    })
  } catch {
    // Best-effort: o SSO logout segue mesmo se o 1746 não responder.
  }
}

/**
 * Logout do Gov.br num iframe oculto (ver `@/lib/govbr-logout`). Só funciona
 * onde o cookie de terceiros do Gov.br vai ao iframe, por isso é usado só no
 * Google Chrome.
 */
function logoutFromGovbr(): Promise<void> {
  const govbrLogoutUrl = buildGovbrLogoutUrl()
  if (!govbrLogoutUrl) return Promise.resolve()

  return new Promise(resolve => {
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = govbrLogoutUrl

    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      iframe.remove()
      resolve()
    }
    iframe.onload = finish
    iframe.onerror = finish
    setTimeout(finish, BACKGROUND_LOGOUT_TIMEOUT_MS)
    document.body.appendChild(iframe)
  })
}

/**
 * Logout da aplicação (`/api/auth/logout`), seguido do logout do 1746 em
 * segundo plano e de uma navegação de topo que encerra a sessão SSO do
 * Keycloak. O Gov.br depende do navegador (`isGoogleChrome`):
 *
 * - Google Chrome: logout do Gov.br no iframe oculto, em paralelo com o 1746,
 *   e depois `/api/auth/sso-logout` (Keycloak → home).
 * - Outros navegadores: bloqueiam o cookie do Gov.br no iframe, então o logout
 *   do Gov.br vai na navegação de topo, por `/api/auth/sso-logout/govbr`
 *   (Keycloak → Gov.br). O usuário termina no Gov.br, deslogado.
 *
 * Compartilhado entre o menu global e o botão Sair.
 */
export function useLogout() {
  const [isLoading, setIsLoading] = useState(false)

  const logout = useCallback(async () => {
    if (isLoading) return // evita cliques repetidos
    setIsLoading(true)

    try {
      await fetch('/api/auth/logout')
    } catch (error) {
      console.error('Logout failed:', error)
      setIsLoading(false)
      return
    }

    // Sessão encerrada: nada do cidadão (chamados, carteira…) pode ficar em
    // memória para o próximo usuário deste navegador.
    getQueryClient().clear()

    if (isGoogleChrome()) {
      await Promise.all([logoutFrom1746(), logoutFromGovbr()])
      window.location.assign(SSO_LOGOUT_ROUTE)
      return
    }

    // O 1746 termina antes: a navegação de topo cancelaria o fetch.
    await logoutFrom1746()
    window.location.assign(SSO_LOGOUT_GOVBR_ROUTE)
  }, [isLoading])

  return { logout, isLoading }
}
