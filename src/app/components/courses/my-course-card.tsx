'use client'

import coursesApi from '@/actions/courses'
import { createCourseSlug } from '@/actions/courses/utils-mock'
import { Skeleton } from '@/components/ui/skeleton'
import type { MY_COURSES } from '@/mocks/mock-courses'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { cn } from '../../../lib/utils'
import { providerIcons } from '../utils'

function MyCoursesSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-lg p-3 bg-background"
        >
          <Skeleton className="w-30 h-30 rounded-xl" />
          <div className="flex flex-col flex-1 min-w-0">
            <Skeleton className="h-4 w-60 mb-3 rounded" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'em análise':
      return 'bg-card-5'
    case 'inscrito':
      return 'bg-card-3'
    case 'finalizado':
      return 'bg-muted-foreground'
    case 'recusado':
      return 'bg-destructive'
    default:
      return 'bg-secondary'
  }
}

export function MyCoursesCard() {
  const [courses, setCourses] = useState<typeof MY_COURSES>([])
  const [loading, setLoading] = useState(true)

  const fetchMyCourses = async () => {
    try {
      const courses = await coursesApi.getMyCourses()
      setCourses(courses)
    } catch (error) {
      console.error('Erro ao carregar cursos:', error)
    } finally {
      setLoading(false)
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <unnecessary>
  useEffect(() => {
    fetchMyCourses()
  }, [])

  if (loading) {
    return <MyCoursesSkeleton />
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
              src={course.imageUrl}
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
                'inline-block px-3 py-1 text-xs font-medium text-background rounded-full w-fit',
                getStatusColor(course.status)
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
