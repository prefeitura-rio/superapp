'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '../../../lib/utils'

interface CourseWithEnrollment {
  id: number
  title: string
  description?: string
  imageUrl?: string
  provider?: string
  status: string
  enrollmentId?: string
  enrolledAt?: string
  updatedAt?: string
  [key: string]: any
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'pending':
    case 'em análise':
      return 'bg-card-5'
    case 'approved':
    case 'inscrito':
      return 'bg-card-3'
    case 'finalizado':
    case 'completed':
      return 'bg-muted-foreground'
    case 'rejected':
    case 'recusado':
      return 'bg-destructive'
    case 'cancelled':
      return 'bg-destructive'
    case 'cancelado':
      return 'bg-secondary'
    default:
      return 'bg-secondary'
  }
}

function getStatusLabel(status: string) {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'Em análise'
    case 'approved':
      return 'Inscrito'
    case 'rejected':
      return 'Recusado'
    case 'cancelled':
      return 'Reprovado'
    case 'concluded':
      return 'Finalizado'
    default:
      return status
  }
}

function getStatusTextColor(status: string) {
  const statusLower = status.toLowerCase()
  if (
    statusLower === 'finalizado' ||
    statusLower === 'completed' ||
    statusLower === 'concluded'
  ) {
    return 'text-foreground'
  }
  return 'text-background dark:text-foreground'
}

export function MyCoursesCard({
  courses,
}: { courses: CourseWithEnrollment[] }) {
  if (courses.length === 0) {
    return (
      <div className="overflow-hidden mt-4 px-4 flex justify-center items-center">
        <p className="block text-lg text-muted-foreground text-center">
          Você ainda não possui nenhum curso.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {courses.map((course, index) => (
        <div key={course.id}>
          <Link
            href={`/servicos/cursos/${course.id}`}
            className="flex items-center gap-3 rounded-lg py-4 bg-background transition cursor-pointer group"
          >
            <div className="relative w-30 h-30 overflow-hidden rounded-xl">
              {course.imageUrl ? (
                <Image
                  src={course.imageUrl}
                  alt={course.title}
                  fill
                  className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                  onError={e => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-xs font-medium">
                    {course.title.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="absolute top-2 left-2 z-20 w-6 h-6 rounded-full  flex items-center justify-center shadow-sm">
                {course.institutional_logo ? (
                  <Image
                    src={course.institutional_logo}
                    alt="institutional logo"
                    width={36}
                    height={36}
                    className="object-contain rounded-full"
                    onError={e => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent) {
                        parent.innerHTML = `<span class="text-[10px] font-semibold text-foreground uppercase">${course.provider?.charAt(0) || 'C'}</span>`
                      }
                    }}
                  />
                ) : (
                  <span className="text-[10px] font-semibold text-foreground uppercase">
                    {course.provider?.charAt(0) || 'C'}
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
                  'inline-block px-3 py-1 text-xs font-medium rounded-full w-fit',
                  getStatusColor(course.status),
                  getStatusTextColor(course.status)
                )}
              >
                {getStatusLabel(course.status)}
              </span>
            </div>
          </Link>
          {index < courses.length - 1 && <div className="h-[1px] bg-border" />}
        </div>
      ))}
    </div>
  )
}
