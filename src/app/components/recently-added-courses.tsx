'use client'

import { ModelsCurso } from '@/http-courses/models'
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
          {courses.map(course => (
            <CourseCard
              courseId={course.id}
              key={course.id}
              title={course.title}
              modality={course.modalidade}
              workload={course.workload}
              institutionaLogo={course.institutional_logo}
              provider={course.organization}
              coverImage={course.cover_image}
            />
          ))}
        </div>
      </div>
    </>
  )
}
