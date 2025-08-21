'use client'

import { cn, createCourseSlug } from '@/lib/utils'
import { MY_COURSES } from '@/mocks/mock-courses'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { providerIcons } from '../utils'

function getMyCourses(): Promise<typeof MY_COURSES> {
  return new Promise(resolve => {
    setTimeout(() => resolve(MY_COURSES), 500) // simula latência
  })
}

export function MyCoursesCard() {
  const [courses, setCourses] = useState<typeof MY_COURSES>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyCourses().then(data => {
      setCourses(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <p className="text-sm text-muted-foreground">Carregando cursos...</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {courses.map(course => (
        <Link
          key={course.id}
          href={`/services/courses/${createCourseSlug(course.id, course.title)}`}
          className="flex items-start gap-3 rounded-lg p-3 bg-background transition cursor-pointer group"
        >
          <div className="relative w-30 h-30 overflow-hidden rounded-xl">
            <Image
              src={course.image}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="absolute top-2 left-2 z-20 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
              {course.provider ? (
                <Image
                  src={providerIcons[course.provider]}
                  alt="provider"
                  width={15}
                  height={15}
                />
              ) : (
                <span className="text-[10px] font-semibold text-foreground uppercase">
                  {course.provider.charAt(0)}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <p className="text-sm font-medium leading-snug text-foreground mb-2">
              {course.title}
            </p>
            <span
              className={cn(
                'inline-block px-3 py-1 text-xs font-medium text-white rounded-full w-fit',
                course.statusColor
              )}
            >
              {course.status}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
