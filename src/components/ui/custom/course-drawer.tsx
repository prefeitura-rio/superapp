'use client'

import type React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Bookmark } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

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

interface CourseDrawerProps {
  course: Course
  color: string
  icon: string
  children: React.ReactNode
  description?: string
  spots?: number
  requirements?: string[]
}

export function CourseDrawer({
  course,
  color,
  icon,
  children,
  description,
  spots,
  requirements,
}: CourseDrawerProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)

  // Use props if provided, otherwise fallback to course object or default
  const courseDescription =
    description ??
    course.description ??
    'O curso oferece uma oportunidade de aprendizado voltada para quem quer desenvolver habilidades essenciais na área. O conteúdo aborda noções fundamentais, com linguagem simples e prática, permitindo que cada pessoa aprenda no seu ritmo.'
  const courseSpots = spots ?? course.spots ?? 20
  const courseRequirements = requirements ?? course.requirements ?? []

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="bg-white border-t-background max-w-md mx-auto !rounded-3xl !max-h-[calc(100vh-90px)] h-[calc(100vh-40px)] flex flex-col">
        <div
          style={{ backgroundColor: color }}
          className="p-6 text-white relative rounded-3xl flex flex-col items-center"
        >
          <div className="absolute right-4 top-4">
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                setIsBookmarked(!isBookmarked)
              }}
              className="focus:outline-none"
            >
              <Bookmark
                className="w-6 h-6 text-white transition-colors"
                fill={isBookmarked ? 'white' : 'transparent'}
              />
            </button>
          </div>
          <div className="absolute top-3">
            <div className="w-7 h-1 rounded-md bg-white" />
          </div>
          <div className="flex flex-col items-center gap-2 mb-4 pt-4">
            <div className="bg-white rounded-full p-2 flex items-center justify-center w-16 h-16 mb-2">
              <Image
                src={icon || '/placeholder.svg'}
                alt={`Logo do ${course.provider}`}
                width={40}
                height={40}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <DrawerTitle className="text-xl font-medium text-white text-center">
              {course.title}
            </DrawerTitle>
            <DrawerDescription className="text-white text-center">
              {course.provider}
            </DrawerDescription>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 justify-center w-full">
            <Badge className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full">
              {course.workload} horas
            </Badge>
            <Badge className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full">
              {course.modality}
            </Badge>
            <Badge className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full">
              {courseSpots} vagas
            </Badge>
          </div>
        </div>
        <div
          className="p-6 flex-1 overflow-y-auto scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Hide scrollbar for Webkit browsers */}
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <h3 className="text-md text-black mb-2">Descrição do Curso</h3>
          <p className="text-black/60 mb-6 text-sm">{courseDescription}</p>

          <h3 className="text-md text-black mb-2">Requisitos</h3>
          {courseRequirements.length > 0 ? (
            <ul className="text-black/60 list-disc list-inside text-sm">
              {courseRequirements.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          ) : (
            <p className="text-black/80">
              Não há requisitos específicos para este curso.
            </p>
          )}
        </div>
        <DrawerFooter>
          <Button
            className="w-full py-6"
            style={{ backgroundColor: color, color: 'white' }}
          >
            Inscreva-se
          </Button>
          {/* <DrawerClose asChild>
            <Button className="w-full py-6" variant="outline">
              Fechar
            </Button>
          </DrawerClose> */}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
