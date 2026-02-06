import { jwtDecode } from 'jwt-decode'

export function isJwtExpired(token: string): boolean {
  try {
    const decoded: { exp?: number } = jwtDecode(token)
    if (!decoded.exp) return true // If no exp field, consider it expired
    const now = Math.floor(Date.now() / 1000)
    return decoded.exp < now
  } catch {
    // If token is invalid/corrupted, treat it as expired to force refresh/logout
    return true
  }
}
