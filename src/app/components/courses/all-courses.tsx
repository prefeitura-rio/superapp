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
      {/* Abaixo de 896px: listagem horizontal */}
      <div className="px-4 pb-6 max-[895px]:block min-[896px]:hidden">
        <div className="flex flex-col">
          {courses.map((course, index) => (
            <div
              key={course.id != null ? String(course.id) : `course-${index}`}
              className={`border-b border-border ${index === courses.length - 1 ? 'border-b-0' : ''}`}
            >
              <CourseCard
                courseId={course.id}
                title={course.title as string}
                modality={course.modalidade as string}
                workload={course.workload as string}
                institutionaLogo={course.institutional_logo as string}
                provider={course.organization as string}
                coverImage={course.cover_image as string}
                accessibility={course.accessibility as AccessibilityProps}
                courseManagementType={course.course_management_type}
                enrollmentEndDate={
                  course.enrollment_end_date ?? course.data_limite_inscricoes
                }
                neighborhood={(course as any).locations?.[0]?.neighborhood}
                variant="horizontal"
                className="py-4"
              />
            </div>
          ))}
        </div>
      </div>
      {/* 896px+: grid de 4 colunas com cards fixos */}
      <div className="hidden min-[896px]:block px-4 pb-6">
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
              courseManagementType={course.course_management_type}
              enrollmentEndDate={
                course.enrollment_end_date ?? course.data_limite_inscricoes
              }
              neighborhood={(course as any).locations?.[0]?.neighborhood}
            />
          ))}
        </div>
      </div>
    </>
  )
}
