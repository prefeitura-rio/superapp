'use client'

import { useQuery } from '@tanstack/react-query'

export interface HeaderData {
  isLoggedIn: boolean
  userName: string
  userCpf: string
  userAvatarUrl: string | null
  userAvatarName: string | null
}

/**
 * Shared query key: the header, the global menu and any other consumer of
 * `/api/user/header` read from the same cache entry.
 */
export const HEADER_QUERY_KEY = ['header'] as const

export const defaultHeaderData: HeaderData = {
  isLoggedIn: false,
  userName: '',
  userCpf: '',
  userAvatarUrl: null,
  userAvatarName: null,
}

export async function fetchHeaderData(): Promise<HeaderData> {
  const response = await fetch('/api/user/header', {
    cache: 'no-store',
    credentials: 'include',
  })
  if (!response.ok) return defaultHeaderData

  const data = await response.json()
  return {
    isLoggedIn: data.isLoggedIn ?? false,
    userName: data.userName ?? '',
    userCpf: data.userCpf ?? '',
    userAvatarUrl: data.userAvatarUrl ?? null,
    userAvatarName: data.userAvatarName ?? null,
  }
}

export function useHeaderData() {
  const { data, isPending } = useQuery({
    queryKey: HEADER_QUERY_KEY,
    queryFn: fetchHeaderData,
    staleTime: 5 * 60 * 1000,
  })

  return { data: data ?? defaultHeaderData, isLoading: isPending }
}
