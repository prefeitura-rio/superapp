'use client'

import { useQuery } from '@tanstack/react-query'

async function fetchUserEnrollment(courseId: number) {
  const res = await fetch(`/api/user/cursos/inscricoes/${courseId}`, {
    cache: 'no-store',
    credentials: 'include',
  })
  if (!res.ok) return { enrollment: null }
  return res.json()
}

export function useUserEnrollment(courseId: number | undefined) {
  return useQuery({
    queryKey: ['user-enrollment', courseId],
    queryFn: () => fetchUserEnrollment(courseId!),
    enabled: courseId !== undefined,
    staleTime: 5 * 60 * 1000,
  })
}
