'use client'

import { createCourseSlug } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

interface CourseCardProps {
  courseId: number
  title: string
  modality: string
  workload: string
  provider: string
  providerIcon?: string
  imageUrl: string
}

export function CourseCard({
  courseId,
  title,
  modality,
  workload,
  provider,
  providerIcon,
  imageUrl,
}: CourseCardProps) {
  const slug = createCourseSlug(courseId, title)

  return (
    <Link
      href={`/services/courses/${slug}`}
      className="w-[197px] rounded-xl overflow-hidden bg-background cursor-pointer group block"
    >
      <div className="relative w-full h-[120px] overflow-hidden rounded-xl">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-2 left-2 z-20 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
          {providerIcon ? (
            <Image src={providerIcon} alt="provider" width={15} height={15} />
          ) : (
            <span className="text-[10px] font-semibold text-foreground uppercase">
              {provider.charAt(0)}
            </span>
          )}
        </div>
      </div>

      <div className="py-2">
        <h3 className="text-sm font-medium text-foreground line-clamp-2">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {modality} • {workload} horas
        </p>
      </div>
    </Link>
  )
}
