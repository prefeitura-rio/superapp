'use client'

import google from '@/assets/google.svg'
import senac from '@/assets/senac.svg'
import senai from '@/assets/senai.svg'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useRef } from 'react'

interface Course {
  id: string
  name: string
  institution: string
  location: string
  hours: number
  color: string
}

interface CourseListProps {
  title?: string
  courses: Course[]
}

export default function CourseList({ title, courses }: CourseListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  return (
    <div>
      {title && (
        <h2 className="relative -mx-4 px-4 mb-6 text-lg font-medium">
          {title}
        </h2>
      )}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-4 -mx-4"
      >
        {courses.map(course => (
          <Card
            key={course.id}
            className={cn(
              'min-w-[250px] max-w-[250px] max-h-[200px] rounded-xl border-none snap-start',
              course.color
            )}
          >
            <CardContent className="p-4">
              <div className="mb-4">
                {course.institution === 'SENAC' && (
                  <Image
                    src={senac}
                    alt="Logo do SENAC"
                    width={60}
                    height={35}
                  />
                )}
                {course.institution === 'Google' && (
                  <Image
                    src={google}
                    alt="Logo do Google"
                    width={35}
                    height={35}
                  />
                )}
                {course.institution === 'SENAI' && (
                  <Image
                    src={senai}
                    alt="Logo do SENAI"
                    width={60}
                    height={35}
                  />
                )}
              </div>
              <h3 className="font-medium text-lg text-black mb-1">
                {course.name}
              </h3>
              <p className="text-xs mb-4 opacity-80 text-black">
                {course.location}
              </p>
              <div className="text-lg font-medium text-black">
                {course.hours}h
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
