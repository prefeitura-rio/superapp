'use client'

import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

interface AuthStatusContextType {
  isLoggedIn: boolean | null
  isLoading: boolean
}

const AuthStatusContext = createContext<AuthStatusContextType>({
  isLoggedIn: null,
  isLoading: true,
})

export const useAuthStatus = () => useContext(AuthStatusContext)

export function AuthStatusProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAuthStatus() {
      try {
        const response = await fetch('/api/user/auth-status')
        const data = await response.json()
        setIsLoggedIn(data.isLoggedIn)
      } catch (error) {
        console.error('Error fetching auth status:', error)
        setIsLoggedIn(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAuthStatus()
  }, [])

  return (
    <AuthStatusContext.Provider value={{ isLoggedIn, isLoading }}>
      {children}
    </AuthStatusContext.Provider>
  )
}
