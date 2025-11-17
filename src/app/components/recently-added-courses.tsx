'use client'

import type { ModelsCurso } from '@/http-courses/models'
import type { AccessibilityProps } from '@/types/course'
import { CourseCard } from './courses/courses-card'

interface RecentlyAddedCoursesProps {
  courses: ModelsCurso[]
}

export default function RecentlyAddedCourses({
  courses,
}: RecentlyAddedCoursesProps) {
  return (
    <>
      <h3 className="pb-2 text-base font-medium text-foreground leading-5 px-4">
        Mais Recentes
      </h3>
      <div className="relative w-full overflow-x-auto pb-2 no-scrollbar">
        <div className="flex gap-4 px-4 w-max">
          {courses.map((course, index) => (
            <CourseCard
              courseId={course.id}
              key={course.id != null ? String(course.id) : `course-${index}`}
              title={course.title as string}
              modality={course.modalidade as string}
              workload={course.workload as string}
              institutionaLogo={course.institutional_logo as string}
              provider={course.organization as string}
              accessibility={course.accessibility as AccessibilityProps}
              coverImage={course.cover_image as string}
              isExternalPartner={course.is_external_partner as boolean}
            />
          ))}
        </div>
      </div>
    </>
  )
}
