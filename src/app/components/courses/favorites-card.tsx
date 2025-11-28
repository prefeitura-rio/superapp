'use client'

import courseApi from '@/actions/courses'
import { createCourseSlug } from '@/actions/courses/utils'
import { Skeleton } from '@/components/ui/skeleton'
import type { ModelsCurso } from '@/http-courses/models'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { providerIcons } from '../utils'

function FavoritesSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex rounded-xl bg-background overflow-hidden">
          <Skeleton className="w-30 h-30 rounded-xl" />
          <div className="p-4 flex-1 space-y-2">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-4 w-50 rounded" />
            <Skeleton className="h-3 w-25 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function FavoritesCard() {
  const [isLoading, setIsLoading] = useState(true)
  const [favorites, setFavorites] = useState<ModelsCurso[]>([])

  const fetchFavorites = async () => {
    try {
      const data = await courseApi.getAllFavoritesCourses()
      setFavorites(data)
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error)
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    setIsLoading(true)
    fetchFavorites().finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return <FavoritesSkeleton />
  }

  if (!favorites.length && !isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-muted-foreground">Nenhum curso favorito</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 px-4">
      {favorites
        .filter(course => course.id && course.title)
        .map(course => (
          <Link
            key={course.id}
            href={`/servicos/cursos/${createCourseSlug(course.id!, course.title!)}`}
            className="flex rounded-xl bg-background transition overflow-hidden cursor-pointer group"
          >
            <div className="relative w-30 h-30 overflow-hidden rounded-xl">
              <Image
                src={
                  course.cover_image ||
                  course.institutional_logo ||
                  '/placeholder-course.png'
                }
                alt={course.title || 'Curso'}
                fill
                className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {course.organization && (
                <div className="absolute top-2 left-2 z-20 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                  {providerIcons[course.organization] ? (
                    <Image
                      src={providerIcons[course.organization]}
                      alt="provider"
                      width={15}
                      height={15}
                    />
                  ) : (
                    <span className="text-[10px] font-semibold text-foreground uppercase">
                      {course.organization.charAt(0)}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 flex-1">
              {course.theme && (
                <div className="text-xs font-medium text-[#5980FF] mb-1 tracking-wide">
                  {course.theme}
                </div>
              )}
              <h3 className="text-base font-medium text-foreground leading-5 tracking-normal">
                {course.title}
              </h3>
              <div className="text-xs text-muted-foreground">
                {course.modalidade || 'N/A'} • {course.carga_horaria || 'N/A'}h
              </div>
            </div>
          </Link>
        ))}
    </div>
  )
}
