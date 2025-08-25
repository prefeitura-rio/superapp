'use client'

import { providerIcons } from '@/app/components/utils'
import { SwiperWrapper } from '@/components/ui/custom/swiper-wrapper'
import { CourseCard } from './courses-card'

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

interface RecentlyAddedCoursesSwipeProps {
  courses: Course[]
}

export function RecentlyAddedCoursesSwipe({
  courses,
}: RecentlyAddedCoursesSwipeProps) {
  const recentCourses = courses.filter(course => course.recentlyAdded)

  if (!recentCourses.length) return null

  return (
    <div className="px-4 pb-6">
      <h3 className="pb-2 text-base font-medium text-foreground leading-5">
        Mais Recentes
      </h3>
      <SwiperWrapper
        showArrows
        showPagination
        arrowsVerticalPosition="top-[30%]"
      >
        {Array.from(
          { length: Math.ceil(recentCourses.length / 4) },
          (_, slideIndex) => {
            const startIndex = slideIndex * 4
            const slideCourses = recentCourses.slice(startIndex, startIndex + 4)

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
                    modality={course.modality}
                    workload={course.workload}
                    providerIcon={providerIcons[course.provider]}
                    provider={course.provider}
                    imageUrl={course.imageUrl}
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
