'use client'

import { CoursesHeaderClient } from '@/app/components/courses/courses-header-client'
import RecentlyAddedCourses from '@/app/components/recently-added-courses'
import { useUserEnrollments } from '@/hooks/courses/use-user-enrollments'
import type { ModelsCurso } from '@/http-courses/models'
import type { CategoryFilter } from '@/lib/course-category-helpers'
import { filterCoursesExcludingMyCourses } from '@/lib/course-utils'
import { useSearchParams } from 'next/navigation'
import { Suspense, useMemo } from 'react'
import { AllCourses } from './all-courses'
import { CategoryFiltersMobile } from './category-filters-mobile'
import { CategoryFiltersSwipe } from './category-filters-swipe'
import { MyCoursesHome } from './my-courses-home'
import { RecentlyAddedCoursesSwipeSkeleton } from './recently-added-courses-skeleton'

function RecentlyAddedOnFirstPage({ courses }: { courses: ModelsCurso[] }) {
  const searchParams = useSearchParams()
  const pageParam = Number.parseInt(searchParams.get('page') ?? '1', 10)
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1

  if (page > 1) return null

  return <RecentlyAddedCourses courses={courses} />
}

export default function CoursePageClient({
  courses,
  categoryFilters,
}: {
  courses: ModelsCurso[]
  categoryFilters: CategoryFilter[]
}) {
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

  const coursesExcludingMine = useMemo(() => {
    return filterCoursesExcludingMyCourses(courses, myCourses)
  }, [courses, myCourses])

  if (courses.length === 0) {
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
          <RecentlyAddedOnFirstPage courses={coursesExcludingMine} />
        </Suspense>
        <Suspense fallback={null}>
          <AllCourses />
        </Suspense>
      </main>
    </div>
  )
}
