'use client'

import coursesApi from '@/actions/courses'
import { providerIcons } from '@/app/components/utils'
import { ChevronLeftIcon } from '@/assets/icons'
import { BookmarkIcon } from '@/assets/icons/bookmark-icon'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { IconButton } from '@/components/ui/custom/icon-button'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Course {
  id: string
  title: string
  description: string
  requirements: string[]
  spots: number
  status: string
  date: string
  provider: string
  workload: string
  modality: string
  type: string
  recommended: boolean
  recentlyAdded: boolean
  imageUrl: string
}

export function CourseDetails({ course }: { course: Course }) {
  const provider = course.provider
  const providerIcon = providerIcons[provider]
  const router = useRouter()

  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const favorite = await coursesApi.isFavoriteCourse(course.id)
        setIsFavorite(favorite)
      } catch (error) {
        console.error('Erro ao verificar favorito:', error)
      } finally {
        setIsInitialLoading(false)
      }
    }

    checkFavoriteStatus()
  }, [course.id])

  const toggleFavorite = async () => {
    if (isLoadingFavorite) return

    setIsLoadingFavorite(true)

    try {
      if (isFavorite) {
        await coursesApi.removeCourseFromFavorites(course.id).then(() => {
          setIsFavorite(false)
        })
      } else {
        await coursesApi.addCourseToFavorites(course.id).then(() => {
          setIsFavorite(true)
        })
      }
    } catch (error) {
      console.error('Erro ao alterar favorito:', error)
    } finally {
      setIsLoadingFavorite(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <div className="h-[320px] md:h-[380px] w-full relative">
          <div className="flex justify-start">
            <IconButton
              icon={ChevronLeftIcon}
              className="top-4 left-4 absolute z-10"
              onClick={() => router.back()}
            />
          </div>
          <Image
            src={course.imageUrl}
            alt={course.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
            <span className="text-white/80 text-sm capitalize">
              {course.type}
            </span>
            <h1 className="text-white font-bold text-2xl md:text-3xl leading-snug">
              {course.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
              {providerIcon ? (
                <Image
                  src={providerIcon}
                  alt="provider"
                  width={25}
                  height={25}
                />
              ) : (
                <span className="text-[10px] font-semibold text-foreground uppercase">
                  {provider.charAt(0)}
                </span>
              )}
            </div>
            <p>{course.provider}</p>
          </div>
        </div>

        <div className="flex justify-between p-4 text-sm">
          <div className="flex gap-4">
            <div>
              <p className="text-muted-foreground">Modalidade</p>
              <p className="font-medium">{course.modality}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Carga horária</p>
              <p className="font-medium">{course.workload} horas</p>
            </div>
            <div>
              <p className="text-muted-foreground">Data início</p>
              <p className="font-medium">{course.date}</p>
            </div>
          </div>

          <CustomButton
            className={`p-2 rounded-full bg-background hover:bg-background-50 border-0 shadow-none outline-none focus:outline-none focus:ring-0 active:outline-none scale-125 ${isLoadingFavorite ? 'opacity-75 cursor-not-allowed' : ''}`}
            variant="ghost"
            onClick={toggleFavorite}
            disabled={isLoadingFavorite || isInitialLoading}
          >
            {isLoadingFavorite ? (
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            ) : (
              <BookmarkIcon
                className={`h-10 w-10 ${isFavorite ? 'text-primary fill-primary' : 'text-foreground'}`}
                isSaved={isFavorite}
              />
            )}
          </CustomButton>
        </div>

        <div className="p-4 w-full max-w-4xl">
          <Link
            href="/servicos/cursos/confirmar-informacoes"
            className="block w-full py-3 text-center text-foreground rounded-full hover:brightness-90 hover:bg-card transition bg-card outline-none focus:outline-none focus:ring-0 active:outline-none"
          >
            Inscreva-se
          </Link>
        </div>

        <div className="p-4 text-muted-foreground text-sm leading-relaxed">
          {course.description}
        </div>

        <div className="p-4 space-y-6">
          <div>
            <h2 className="text-base font-semibold mb-2">Pré-requisitos</h2>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              {course.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-2">Orientações gerais</h2>
            <p className="text-sm text-muted-foreground">
              A capacitação pode incluir atividades presenciais, e os
              participantes devem seguir todas as orientações enviadas pela
              instituição responsável.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-2">Certificado</h2>
            <p className="text-sm text-muted-foreground">
              Os participantes que concluírem o curso com aproveitamento
              receberão certificado válido emitido pela instituição promotora.
            </p>
          </div>
        </div>

        <div className="p-4 w-full max-w-4xl">
          <Link
            href="/servicos/cursos/confirmar-informacoes"
            className="block w-full py-3 text-center text-foreground rounded-full hover:brightness-90 hover:bg-card transition bg-card outline-none focus:outline-none focus:ring-0 active:outline-none"
          >
            Inscreva-se
          </Link>
        </div>
      </div>
    </div>
  )
}
