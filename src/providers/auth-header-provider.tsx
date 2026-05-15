'use client'

import { useQuery } from '@tanstack/react-query'
import { type ReactNode, createContext, useCallback, useContext } from 'react'

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

async function fetchHeaderData(): Promise<AuthHeaderData> {
  const response = await fetch('/api/user/header', {
    cache: 'no-store',
    credentials: 'include',
  })
  if (!response.ok) return defaultData
  const d = await response.json()
  return {
    isLoggedIn: d.isLoggedIn ?? false,
    userName: d.userName ?? '',
    userAvatarUrl: d.userAvatarUrl ?? null,
    userAvatarName: d.userAvatarName ?? null,
  }
}

export function AuthHeaderProvider({ children }: { children: ReactNode }) {
  const {
    data,
    isLoading,
    refetch: queryRefetch,
  } = useQuery({
    queryKey: ['header'],
    queryFn: fetchHeaderData,
    staleTime: 5 * 60 * 1000,
  })

  const refetch = useCallback(async () => {
    await queryRefetch()
  }, [queryRefetch])

  return (
    <AuthHeaderContext.Provider
      value={{ data: data ?? defaultData, isLoading, refetch }}
    >
      {children}
    </AuthHeaderContext.Provider>
  )
}
