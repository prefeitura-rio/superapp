import type { ModelsCurso } from '@/http-courses/models'
import type { AccessibilityProps } from '@/types/course'
import { CourseCard } from './courses-card'

interface AllCoursesProps {
  courses: ModelsCurso[]
}

export function AllCourses({ courses }: AllCoursesProps) {
  if (courses.length === 0) return null

  return (
    <>
      <h3 className="pb-2 text-base font-medium text-foreground leading-5 px-4">
        Todos os cursos
      </h3>
      {/* Mobile: layout horizontal (até max-w-xl = 576px) */}
      <div className="px-4 pb-6 max-[576px]:block min-[577px]:hidden">
        <div className="flex flex-col gap-4">
          {courses.map((course, index) => (
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
              variant="horizontal"
            />
          ))}
        </div>
      </div>
      {/* Desktop: grid de 4 colunas e n linhas (acima de max-w-xl = 576px) */}
      <div className="hidden min-[577px]:block px-4 pb-6">
        <div className="grid grid-cols-4 gap-4">
          {courses.map((course, index) => (
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

