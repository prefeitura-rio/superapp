'use client'

import { CoursesHeaderClient } from '@/app/components/courses/courses-header-client'
import RecentlyAddedCourses from '@/app/components/recently-added-courses'
import { useAllCoursesPage } from '@/hooks/courses/use-all-courses-page'
import { useUserEnrollments } from '@/hooks/courses/use-user-enrollments'
import type { ModelsCurso } from '@/http-courses/models'
import type { CategoryFilter } from '@/lib/course-category-helpers'
import { filterCoursesExcludingMyCourses } from '@/lib/course-utils'
import type { CoursesPageResult } from '@/lib/courses-list-query'
import { useSearchParams } from 'next/navigation'
import { Suspense, useMemo, useState } from 'react'
import { AllCourses } from './all-courses'
import { CategoryFiltersMobile } from './category-filters-mobile'
import { CategoryFiltersSwipe } from './category-filters-swipe'
import { MyCoursesHome } from './my-courses-home'
import { RecentlyAddedCoursesSwipeSkeleton } from './recently-added-courses-skeleton'

function RecentlyAddedOnFirstPage({
  initialData,
  initialDataUpdatedAt,
  myCourses,
}: {
  initialData?: CoursesPageResult
  initialDataUpdatedAt?: number
  myCourses: ModelsCurso[]
}) {
  const searchParams = useSearchParams()
  const pageParam = Number.parseInt(searchParams.get('page') ?? '1', 10)
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1

  const { data } = useAllCoursesPage(1, {
    initialData,
    initialDataUpdatedAt,
  })

  const coursesExcludingMine = useMemo(() => {
    return filterCoursesExcludingMyCourses(data?.courses ?? [], myCourses)
  }, [data?.courses, myCourses])

  if (page > 1) return null

  return <RecentlyAddedCourses courses={coursesExcludingMine} />
}

export default function CoursePageClient({
  initialCoursesPage,
  categoryFilters,
}: {
  initialCoursesPage: CoursesPageResult
  categoryFilters: CategoryFilter[]
}) {
  // Capture once so TanStack staleTime is measured from hydration, not re-renders
  const [initialDataUpdatedAt] = useState(() => Date.now())

  const { data: enrollmentsData, isLoading: isLoadingEnrollments } =
    useUserEnrollments()

  const myCourses: ModelsCurso[] = useMemo(() => {
    const enrollments = enrollmentsData?.enrollments || []
    return enrollments
      .map((enrollment: any) => ({
        ...enrollment.curso,
        id: enrollment.course_id,
      }))
      .filter((course: any) => course.id)
  }, [enrollmentsData])

  if (initialCoursesPage.courses.length === 0) {
    return (
      <div className="min-h-lvh">
        <CoursesHeaderClient />
        <main className="max-w-4xl mx-auto pb-20 text-white">
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-lg text-muted-foreground text-center">
              Nenhum curso encontrado
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-lvh">
      <CoursesHeaderClient />
      <main className="max-w-4xl mx-auto pb-34 text-white">
        {categoryFilters.length > 0 && (
          <>
            <div className="block sm:hidden">
              <CategoryFiltersMobile categoryFilters={categoryFilters} />
            </div>
            <div className="hidden sm:block">
              <CategoryFiltersSwipe categoryFilters={categoryFilters} />
            </div>
          </>
        )}

        {isLoadingEnrollments ? (
          <RecentlyAddedCoursesSwipeSkeleton />
        ) : (
          myCourses.length > 0 && <MyCoursesHome courses={myCourses} />
        )}

        <Suspense fallback={null}>
          <RecentlyAddedOnFirstPage
            initialData={initialCoursesPage}
            initialDataUpdatedAt={initialDataUpdatedAt}
            myCourses={myCourses}
          />
        </Suspense>
        <Suspense fallback={null}>
          <AllCourses
            initialData={initialCoursesPage}
            initialDataUpdatedAt={initialDataUpdatedAt}
          />
        </Suspense>
      </main>
    </div>
  )
}
