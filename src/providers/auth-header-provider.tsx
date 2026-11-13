'use client'

import {
  HEADER_QUERY_KEY,
  type HeaderData,
  defaultHeaderData,
  fetchHeaderData,
} from '@/hooks/use-header-data'
import { useQuery } from '@tanstack/react-query'
import { type ReactNode, createContext, useCallback, useContext } from 'react'

export type AuthHeaderData = HeaderData

interface AuthHeaderContextType {
  data: AuthHeaderData
  isLoading: boolean
  refetch: () => Promise<void>
}

const AuthHeaderContext = createContext<AuthHeaderContextType>({
  data: defaultHeaderData,
  isLoading: true,
  refetch: async () => {},
})

export const useAuthHeader = () => useContext(AuthHeaderContext)

export function AuthHeaderProvider({ children }: { children: ReactNode }) {
  const {
    data,
    isPending,
    refetch: queryRefetch,
  } = useQuery({
    queryKey: HEADER_QUERY_KEY,
    queryFn: fetchHeaderData,
    staleTime: 5 * 60 * 1000,
  })

  const refetch = useCallback(async () => {
    await queryRefetch()
  }, [queryRefetch])

  return (
    <AuthHeaderContext.Provider
      value={{ data: data ?? defaultHeaderData, isLoading: isPending, refetch }}
    >
      {children}
    </AuthHeaderContext.Provider>
  )
}
