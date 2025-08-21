'use client'

import { createCourseSlug } from '@/lib/utils'
import { COURSES } from '@/mocks/mock-courses'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { providerIcons } from '../utils'

async function getFavorites(): Promise<typeof COURSES> {
  return new Promise(resolve => {
    setTimeout(() => {
      const favoriteCoursesId = localStorage.getItem('courses-favorites')
      const favoriteCourses = COURSES.filter(course =>
        favoriteCoursesId
          ? JSON.parse(favoriteCoursesId).includes(course.id)
          : false
      )
      resolve(favoriteCourses)
    }, 400)
  })
}

export function FavoritesCard() {
  const [favorites, setFavorites] = useState<typeof COURSES>([])

  useEffect(() => {
    getFavorites().then(data => setFavorites(data))
  }, [])

  if (!favorites.length) {
    return (
      <div className="text-center text-muted-foreground py-6">
        Você ainda não possui cursos favoritos.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 px-4">
      {favorites.map(course => (
        <Link
          key={course.id}
          href={`/services/courses/${createCourseSlug(course.id, course.title)}`}
          className="flex rounded-xl bg-background transition overflow-hidden cursor-pointer group"
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

          <div className="p-4 flex-1">
            <div className="text-xs font-medium text-[#5980FF] mb-1 tracking-wide">
              {course.type}
            </div>
            <h3 className="text-base font-medium text-foreground leading-5 tracking-normal">
              {course.title}
            </h3>
            <div className="text-xs text-muted-foreground">
              {course.modality} • {course.workload} horas
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
