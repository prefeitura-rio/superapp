'use client'

import { SwiperWrapper } from '@/components/ui/custom/swiper-wrapper'
import { ModelsCurso } from '@/http-courses/models'
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
                {slideCourses.map(course => (
                  <CourseCard
                    key={course.id}
                    courseId={course.id}
                    title={course.title}
                    modality={course.modalidade}
                    workload={course.workload}
                    institutionaLogo={course.institutional_logo}
                    provider={course.organization}
                    coverImage={course.cover_image}
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
