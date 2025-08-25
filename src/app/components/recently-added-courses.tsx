'use client'

import { CourseCard } from './courses/courses-card'
import { providerIcons } from './utils'

interface Course {
  id: string
  title: string
  status: string
  date: string
  provider: string
  workload: string
  modality: string
  type: string
  recommended: boolean
  recentlyAdded: boolean
  spots?: number
  description?: string
  requirements?: string[]
  imageUrl: string
}

interface RecentlyAddedCoursesProps {
  courses: Course[]
}

export default function RecentlyAddedCourses({
  courses,
}: RecentlyAddedCoursesProps) {
  const recentCourses = courses.filter(course => course.recentlyAdded)

  return (
    <>
      <h3 className="pb-2 text-base font-medium text-foreground leading-5 px-4">
        Mais Recentes
      </h3>
      <div className="relative w-full overflow-x-auto pb-2 no-scrollbar">
        <div className="flex gap-4 px-4 w-max">
          {recentCourses.map(course => (
            <CourseCard
              courseId={course.id}
              key={course.id}
              title={course.title}
              modality={course.modality}
              workload={course.workload}
              providerIcon={providerIcons[course.provider]}
              provider={course.provider}
              imageUrl={course.imageUrl}
            />
          ))}
        </div>
      </div>
    </>
  )
}
