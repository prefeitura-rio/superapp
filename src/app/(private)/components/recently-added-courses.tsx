'use client'

import googleIcon from '@/assets/google.svg'
import prefeituraVertical from '@/assets/prefeituraVertical.svg'
import senac from '@/assets/senac.svg'
import senaiIcon from '@/assets/senai.svg'
import { CourseDrawer } from '@/components/ui/custom/course-drawer'

import { Bookmark } from 'lucide-react'
import Image from 'next/image'

interface Course {
  id: number
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
}

interface RecentlyAddedCoursesProps {
  courses: Course[]
}

const providerIcons: Record<string, string> = {
  Google: googleIcon,
  SENAI: senaiIcon,
  Prefeitura: prefeituraVertical,
  SENAC: senac,
}

function getCardColor(type: string) {
  if (type === 'technology' || type === 'ai' || type === 'education')
    return '#01A9D8'
  if (type === 'construction') return '#44CC77'
  if (type === 'environment') return '#EA5D6E'
  return '#01A9D8'
}

export default function RecentlyAddedCourses({
  courses,
}: RecentlyAddedCoursesProps) {
  const recentCourses = courses.filter(course => course.recentlyAdded)

  return (
    <>
      <h2 className="text-md font-medium mb-4 px-5 pt-6">Recentes</h2>
      <div className="flex flex-col gap-4 px-5 pb-8">
        {recentCourses.map(course => (
          <CourseDrawer
            key={course.id}
            course={course}
            color={getCardColor(course.type)}
            icon={providerIcons[course.provider] || googleIcon}
            description={course.description}
            spots={course.spots}
            requirements={course.requirements}
          >
            <div className="bg-zinc-900 rounded-2xl p-2 py-6 flex items-center gap-4 relative border-2 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer">
              <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center">
                <Image
                  src={providerIcons[course.provider] || googleIcon}
                  alt={course.provider}
                  width={36}
                  height={56}
                  className={
                    course.provider === 'Prefeitura'
                      ? 'filter brightness-0 invert'
                      : ''
                  }
                />
              </div>
              <div className="flex-1">
                <h3 className="text-md mb-2 line-clamp-2 pr-4 leading-5 text-white">
                  {course.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs">
                    {course.provider}
                  </span>
                  <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs">
                    {course.workload}
                  </span>
                  <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs">
                    {course.modality}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="absolute right-2 top-2 text-zinc-400 hover:text-white transition-colors"
                onClick={e => e.stopPropagation()}
              >
                <Bookmark className="w-5 h-5" />
                <span className="sr-only">Bookmark course</span>
              </button>
            </div>
          </CourseDrawer>
        ))}
      </div>
    </>
  )
}
