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
      return 'Cancelado'
    case 'concluded':
      return 'Finalizado'
    default:
      return status
  }
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
    <div className="flex flex-col gap-3">
      {courses.map(course => (
        <Link
          key={course.id}
          href={`/servicos/cursos/${course.id}`}
          className="flex items-start gap-3 rounded-lg py-3 bg-background transition cursor-pointer group"
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

            <div className="absolute top-2 left-2 z-20 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
              {course.institutional_logo ? (
                <Image
                  src={course.institutional_logo}
                  alt="institutional logo"
                  width={15}
                  height={15}
                  className="object-contain"
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
                'inline-block px-3 py-1 text-xs font-medium text-background dark:text-foreground rounded-full w-fit',
                getStatusColor(course.status)
              )}
            >
              {getStatusLabel(course.status)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
