'use server'

import { getEnv } from '@/env/server'
import { redirect } from 'next/navigation'

export async function getGovbrLoginUrl(state: string): Promise<string> {
  const env = await getEnv()

  const scope = encodeURIComponent('openid+profile+address+phone+roles')
  const redirectUri = env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_REDIRECT_URI
  const clientId = env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID
  const idCariocaBaseUrl = env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL

  return `${idCariocaBaseUrl}/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}`
}

export async function redirectToGovbrLogin(state: string) {
  const loginUrl = await getGovbrLoginUrl(state)
  redirect(loginUrl)
}
