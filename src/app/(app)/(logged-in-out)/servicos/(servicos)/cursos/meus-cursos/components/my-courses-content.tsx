'use client'

import { MyCoursesCard } from '@/app/components/courses/my-course-card'
import { useUserEnrollments } from '@/hooks/courses/use-user-enrollments'
import { useMemo } from 'react'

export function MyCoursesContent() {
  const { data: enrollmentsData, isLoading } = useUserEnrollments()

  const courses = useMemo(() => {
    const enrollments = enrollmentsData?.enrollments || []
    return enrollments
      .map((enrollment: any) => ({
        ...enrollment.curso,
        id: enrollment.course_id,
        title: enrollment.curso?.title || 'Curso',
        description: enrollment.curso?.description,
        imageUrl:
          enrollment.curso?.cover_image || enrollment.curso?.institutional_logo,
        provider: enrollment.curso?.organization,
        status: enrollment.status,
        enrollmentId: enrollment.id,
        enrolledAt: enrollment.enrolled_at,
        updatedAt: enrollment.updated_at,
      }))
      .filter((course: any) => course.id)
  }, [enrollmentsData])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 mt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="flex items-center gap-3 py-4 animate-pulse"
          >
            <div className="w-30 h-30 rounded-xl bg-card shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-4 bg-card rounded w-3/4" />
              <div className="h-4 bg-card rounded w-1/2" />
              <div className="h-6 bg-card rounded-full w-20 mt-1" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return <MyCoursesCard courses={courses} />
}
