import type { ModelsCurso } from '@/http-courses/models'
import { CourseCard } from '../courses/courses-card'

interface MyCoursesHomeProps {
  courses: ModelsCurso[]
}

export function MyCoursesHome({ courses }: MyCoursesHomeProps) {
  return (
    <>
      <h3 className="pb-2 text-base font-medium text-foreground leading-5 px-4">
        Meus Cursos
      </h3>
      <div className="relative w-full overflow-x-auto pb-6 no-scrollbar">
        <div className="flex gap-4 px-4 w-max">
          {courses.map(course => (
            <CourseCard
              courseId={course.id as number}
              key={course.id as string}
              title={course.title as string}
              modality={course.modalidade as string}
              workload={course.workload as string}
              institutionaLogo={course.institutional_logo as string}
              provider={course.organization as string}
              coverImage={course.cover_image as string}
            />
          ))}
        </div>
      </div>
    </>
  )
}
