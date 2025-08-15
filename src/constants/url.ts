export const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = `${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL}/auth?client_id=${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_REDIRECT_URI}&response_type=code`
export const REDIRECT_WHEN_SESSION_EXPIRED_ROUTE = '/session-expired'
