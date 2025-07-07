import type { Course } from '@/types/course'
import CourseCard from './course-card'
import { getCourseCardColor, providerIcons } from './utils'

interface RecommendedCoursesCardsProps {
  courses: Course[]
}

export default function RecommendedCoursesCards({
  courses,
}: RecommendedCoursesCardsProps) {
  const recommended = courses.filter(course => course.recommended)
  return (
    <>
      <h2 className="text-md font-medium mb-4 px-4 pt-4">Recomendados</h2>
      <div className="relative w-full overflow-x-auto pb-2 no-scrollbar">
        <div className="flex gap-4 px-4 w-max">
          {recommended.map(course => (
            <CourseCard
              key={course.id}
              id={course.id}
              provider={course.provider}
              title={course.title}
              workload={course.workload}
              modality={course.modality}
              color={getCourseCardColor(course.type)}
              icon={providerIcons[course.provider]}
              status={course.status}
              date={course.date}
              type={course.type}
              recommended={course.recommended}
              recentlyAdded={course.recentlyAdded}
              spots={course.spots}
              description={course.description}
              requirements={course.requirements}
            />
          ))}
        </div>
      </div>
    </>
  )
}
