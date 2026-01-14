'use client'

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

export interface AuthHeaderData {
  isLoggedIn: boolean
  userName: string
  userAvatarUrl: string | null
  userAvatarName: string | null
}

interface AuthHeaderContextType {
  data: AuthHeaderData
  isLoading: boolean
  refetch: () => Promise<void>
}

const defaultData: AuthHeaderData = {
  isLoggedIn: false,
  userName: '',
  userAvatarUrl: null,
  userAvatarName: null,
}

const AuthHeaderContext = createContext<AuthHeaderContextType>({
  data: defaultData,
  isLoading: true,
  refetch: async () => {},
})

export const useAuthHeader = () => useContext(AuthHeaderContext)

export function AuthHeaderProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AuthHeaderData>(defaultData)
  const [isLoading, setIsLoading] = useState(true)

  const fetchAuthHeader = useCallback(async () => {
    try {
      const response = await fetch('/api/user/header', {
        cache: 'no-store',
        credentials: 'include',
      })

      if (!response.ok) {
        setData(defaultData)
        return
      }

      const responseData = await response.json()
      setData({
        isLoggedIn: responseData.isLoggedIn ?? false,
        userName: responseData.userName ?? '',
        userAvatarUrl: responseData.userAvatarUrl ?? null,
        userAvatarName: responseData.userAvatarName ?? null,
      })
    } catch (error) {
      console.error('Error fetching auth header:', error)
      setData(defaultData)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refetch = useCallback(async () => {
    setIsLoading(true)
    await fetchAuthHeader()
  }, [fetchAuthHeader])

  useEffect(() => {
    fetchAuthHeader()
  }, [fetchAuthHeader])

  return (
    <AuthHeaderContext.Provider value={{ data, isLoading, refetch }}>
      {children}
    </AuthHeaderContext.Provider>
  )
}
