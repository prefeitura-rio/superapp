'use client'

import {
  COURSES_LIST_STALE_MS,
  COURSES_PAGE_SIZE,
  type CoursesPageResult,
  allCoursesQueryKey,
  fetchCoursesPage,
} from '@/lib/courses-list-query'
import { useQuery } from '@tanstack/react-query'

export type { CoursesPageResult }
export { COURSES_LIST_STALE_MS, COURSES_PAGE_SIZE, allCoursesQueryKey }

interface UseAllCoursesPageOptions {
  /** SSR snapshot for page 1 — shared by "Mais recentes" and "Todos os cursos" */
  initialData?: CoursesPageResult
  initialDataUpdatedAt?: number
}

export function useAllCoursesPage(
  page: number,
  options: UseAllCoursesPageOptions = {}
) {
  const { initialData, initialDataUpdatedAt } = options
  const isPageOne = page === 1

  return useQuery({
    queryKey: allCoursesQueryKey(page),
    queryFn: () => fetchCoursesPage(page, COURSES_PAGE_SIZE),
    staleTime: COURSES_LIST_STALE_MS,
    initialData: isPageOne ? initialData : undefined,
    initialDataUpdatedAt: isPageOne ? initialDataUpdatedAt : undefined,
  })
}
