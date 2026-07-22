import type { ModelsCurso } from '@/http-courses/models'

/** Aligned with DAL `revalidate: 300` in getDalCourses */
export const COURSES_LIST_STALE_MS = 5 * 60 * 1000

export const COURSES_PAGE_SIZE = 20

export interface CoursesPageResult {
  courses: ModelsCurso[]
  pagination?: {
    limit: number
    page: number
    total: number
    total_pages: number
  }
}

export function allCoursesQueryKey(page: number) {
  return ['all-courses', page] as const
}

export async function fetchCoursesPage(
  page: number,
  limit: number = COURSES_PAGE_SIZE
): Promise<CoursesPageResult> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const res = await fetch(`/api/courses/search?${params}`)
  if (!res.ok) throw new Error('Erro ao buscar cursos')
  return res.json()
}
