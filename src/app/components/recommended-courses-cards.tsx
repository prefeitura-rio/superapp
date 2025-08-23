import type { Course } from '@/types/course'
import { CourseCard } from './courses/courses-card'
import { providerIcons } from './utils'

interface RecommendedCoursesCardsProps {
  courses: Course[]
}

export default function RecommendedCoursesCards({
  courses,
}: RecommendedCoursesCardsProps) {
  const recommended = courses.filter(course => course.recommended)
  return (
    <>
      <h3 className="pb-2 text-base font-medium text-foreground leading-5 px-4">
        Mais Populares
      </h3>
      <div className="relative w-full overflow-x-auto pb-2 no-scrollbar">
        <div className="flex gap-4 px-4 w-max">
          {recommended.map(course => (
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
