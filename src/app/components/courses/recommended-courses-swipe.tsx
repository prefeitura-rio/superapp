'use client'

import { SwiperWrapper } from '@/components/ui/custom/swiper-wrapper'
import type { ModelsCurso } from '@/http-courses/models'
import type { AccessibilityProps } from '@/types/course'
import { CourseCard } from './courses-card'

interface RecommendedCoursesSwipeProps {
  courses: ModelsCurso[]
}

export function RecommendedCoursesSwipe({
  courses,
}: RecommendedCoursesSwipeProps) {
  if (!courses.length) return null

  return (
    <div className="px-4 pb-6">
      <h3 className="pb-2 text-base font-medium text-foreground leading-5">
        Mais Populares
      </h3>
      <SwiperWrapper
        showArrows
        showPagination
        arrowsVerticalPosition="top-[30%]"
      >
        {Array.from(
          { length: Math.ceil(courses.length / 4) },
          (_, slideIndex) => {
            const startIndex = slideIndex * 4
            const slideCourses = courses.slice(startIndex, startIndex + 4)

            return (
              <div
                key={`slide-${slideIndex}`}
                className="grid grid-cols-4 gap-4"
              >
                {slideCourses.map((course, courseIndex) => (
                  <CourseCard
                    key={
                      course.id != null
                        ? String(course.id)
                        : `course-${slideIndex}-${courseIndex}`
                    }
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
                ))}
              </div>
            )
          }
        )}
      </SwiperWrapper>
    </div>
  )
}
