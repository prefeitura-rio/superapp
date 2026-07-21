'use client'

import { CourseCard } from '@/app/components/courses/courses-card'
import { CourseCardSkeleton } from '@/app/components/courses/recently-added-courses-skeleton'
import { Pagination } from '@/components/ui/pagination'
import type { ModelsCurso } from '@/http-courses/models'
import type { AccessibilityProps } from '@/types/course'
import { useQuery } from '@tanstack/react-query'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect } from 'react'

const ALL_COURSES_SKELETON_COUNT = 8

const COURSES_PAGE_SIZE = 20

interface CoursesPageResult {
  courses: ModelsCurso[]
  pagination?: {
    limit: number
    page: number
    total: number
    total_pages: number
  }
}

async function fetchCoursesPage(
  page: number,
  limit: number
): Promise<CoursesPageResult> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const res = await fetch(`/api/courses/search?${params}`)
  if (!res.ok) throw new Error('Erro ao buscar cursos')
  return res.json()
}

function resolveTotalPages(
  pagination: CoursesPageResult['pagination'],
  pageSize: number
): number {
  if (pagination?.total_pages != null && pagination.total_pages > 0) {
    return pagination.total_pages
  }
  if (pagination?.total != null && pageSize > 0) {
    return Math.max(1, Math.ceil(pagination.total / pageSize))
  }
  return 1
}

export function AllCourses() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const pageParam = Number.parseInt(searchParams.get('page') ?? '1', 10)
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1

  const { data, isLoading, isError } = useQuery({
    queryKey: ['all-courses', page],
    queryFn: () => fetchCoursesPage(page, COURSES_PAGE_SIZE),
    staleTime: 2 * 60 * 1000,
  })

  const courses = data?.courses ?? []
  const totalPages = resolveTotalPages(data?.pagination, COURSES_PAGE_SIZE)

  const handlePageChange = useCallback(
    (nextPage: number) => {
      const params = new URLSearchParams(searchParams.toString())
      if (nextPage <= 1) params.delete('page')
      else params.set('page', String(nextPage))

      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      })
    },
    [pathname, router, searchParams]
  )

  useEffect(() => {
    if (!data) return
    if (page > totalPages && totalPages >= 1) {
      handlePageChange(totalPages)
    }
  }, [data, page, totalPages, handlePageChange])

  if (isLoading) {
    return (
      <>
        <h3 className="pb-2 text-base font-medium text-foreground leading-5 px-4">
          Todos os cursos
        </h3>
        {/* Abaixo de 896px: listagem horizontal */}
        <div className="px-4 max-[895px]:block min-[896px]:hidden">
          <div className="flex flex-col">
            {Array.from({ length: ALL_COURSES_SKELETON_COUNT }).map((_, i) => (
              <div
                key={i}
                className={`border-b border-border ${i === ALL_COURSES_SKELETON_COUNT - 1 ? 'border-b-0' : ''}`}
              >
                <CourseCardSkeleton variant="horizontal" className="py-4" />
              </div>
            ))}
          </div>
        </div>
        {/* 896px+: grid de 4 colunas com cards fixos */}
        <div className="hidden min-[896px]:block px-4 pb-6">
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: ALL_COURSES_SKELETON_COUNT }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </>
    )
  }

  if (isError || courses.length === 0) return null

  return (
    <>
      <h3 className="pb-2 text-base font-medium text-foreground leading-5 px-4">
        Todos os cursos
      </h3>
      {/* Abaixo de 896px: listagem horizontal */}
      <div className="px-4 max-[895px]:block min-[896px]:hidden">
        <div className="flex flex-col">
          {courses.map((course, index) => (
            <div
              key={course.id != null ? String(course.id) : `course-${index}`}
              className={`border-b border-border ${index === courses.length - 1 ? 'border-b-0' : ''}`}
            >
              <CourseCard
                courseId={course.id}
                title={course.title as string}
                modality={course.modalidade as string}
                workload={course.workload as string}
                institutionaLogo={course.institutional_logo as string}
                provider={course.organization as string}
                coverImage={course.cover_image as string}
                accessibility={course.accessibility as AccessibilityProps}
                courseManagementType={course.course_management_type}
                enrollmentEndDate={
                  course.enrollment_end_date ?? course.data_limite_inscricoes
                }
                course={course}
                variant="horizontal"
                className="py-4"
              />
            </div>
          ))}
        </div>
      </div>
      {/* 896px+: grid de 4 colunas com cards fixos */}
      <div className="hidden min-[896px]:block px-4">
        <div className="grid grid-cols-4 gap-4">
          {courses.map((course, index) => (
            <CourseCard
              courseId={course.id}
              key={course.id != null ? String(course.id) : `course-${index}`}
              title={course.title as string}
              modality={course.modalidade as string}
              workload={course.workload as string}
              institutionaLogo={course.institutional_logo as string}
              provider={course.organization as string}
              coverImage={course.cover_image as string}
              accessibility={course.accessibility as AccessibilityProps}
              courseManagementType={course.course_management_type}
              enrollmentEndDate={
                course.enrollment_end_date ?? course.data_limite_inscricoes
              }
              course={course}
            />
          ))}
        </div>
      </div>
      <Pagination
        page={Math.min(page, totalPages)}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        className="pt-12 px-4"
      />
    </>
  )
}
