export interface TokenRefreshResult {
  success: boolean
  accessToken?: string
  newRefreshToken?: string
  error?: string
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenRefreshResult> {
  try {
    const tokenUrl = `${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL}/token`
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID!,
      client_secret: process.env.IDENTIDADE_CARIOCA_CLIENT_SECRET!,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    })

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })

    if (!response.ok) {
      return { success: false, error: 'Failed to refresh token' }
    }

    const data = await response.json()
    return {
      success: true,
      accessToken: data.access_token,
      newRefreshToken: data.refresh_token,
    }
  } catch (error) {
    return { success: false, error: 'Network error during token refresh' }
  }
}
