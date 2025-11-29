import type { ModelsCurso } from '@/http-courses/models'
import type { AccessibilityProps } from '@/types/course'
import { CourseCard } from '../courses/courses-card'

interface MyCoursesHomeProps {
  courses: ModelsCurso[]
}

export function MyCoursesHome({ courses }: MyCoursesHomeProps) {
  // Mostrar apenas os primeiros 4 cursos
  const limitedCourses = courses.slice(0, 4)

  if (limitedCourses.length === 0) return null

  return (
    <>
      <h3 className="pb-2 text-base font-medium text-foreground leading-5 px-4">
        Meus Cursos
      </h3>
      {/* Mobile: 4 cards em linha com scroll horizontal invisível (até max-w-xl = 576px) */}
      <div className="relative w-full overflow-x-auto pb-6 no-scrollbar max-[576px]:block min-[577px]:hidden">
        <div className="flex gap-2 px-4 min-w-max">
          {limitedCourses.map((course, index) => (
            <div key={course.id != null ? String(course.id) : `course-${index}`} className="shrink-0">
              <CourseCard
                courseId={course.id}
                title={course.title as string}
                modality={course.modalidade as string}
                workload={course.workload as string}
                institutionaLogo={course.institutional_logo as string}
                provider={course.organization as string}
                coverImage={course.cover_image as string}
                accessibility={course.accessibility as AccessibilityProps}
                isExternalPartner={course.is_external_partner as boolean}
              />
            </div>
          ))}
        </div>
      </div>
      {/* Desktop: grid de 4 colunas sem scroll (acima de max-w-xl = 576px) */}
      <div className="hidden min-[577px]:block px-4 pb-6">
        <div className="grid grid-cols-4 gap-2">
          {limitedCourses.map((course, index) => (
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
              isExternalPartner={course.is_external_partner as boolean}
              className="w-full"
            />
          ))}
        </div>
      </div>
    </>
  )
}
