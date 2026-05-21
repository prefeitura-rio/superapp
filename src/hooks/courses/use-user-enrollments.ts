'use client'

import { useQuery } from '@tanstack/react-query'

async function fetchUserEnrollments() {
  const res = await fetch('/api/user/cursos/inscricoes', {
    cache: 'no-store',
    credentials: 'include',
  })
  if (!res.ok) return { enrollments: [] }
  return res.json()
}

export function useUserEnrollments() {
  return useQuery({
    queryKey: ['user-enrollments'],
    queryFn: fetchUserEnrollments,
    staleTime: 5 * 60 * 1000,
  })
}
