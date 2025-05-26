'use client'

import googleIcon from '@/assets/google.svg'
import prefeituraVertical from '@/assets/prefeituraVertical.svg'
import senac from '@/assets/senac.svg'
import senaiIcon from '@/assets/senai.svg'
import { CourseDrawer } from '@/components/ui/custom/course-drawer'
import type { Course } from '@/types/course'
import { BookmarkIcon } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { getCardColor } from './utils'

const providerIcons: Record<string, string> = {
  Google: googleIcon,
  SENAI: senaiIcon,
  Prefeitura: prefeituraVertical,
  SENAC: senac,
}

export default function CourseCardSearchPage({ course }: { course: Course }) {
  const color = getCardColor(course.type)
  const icon = providerIcons[course.provider] || googleIcon
  const [isSaved, setIsSaved] = useState(false)

  return (
    <CourseDrawer
      course={course}
      color={color}
      icon={icon}
      description={course.description}
      spots={course.spots}
      requirements={course.requirements}
    >
      <div
        className="rounded-3xl p-5 mb-5 relative overflow-hidden flex flex-col cursor-pointer"
        style={{ height: 190, backgroundColor: color }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-white rounded-lg p-1 flex items-center justify-center">
            <Image
              src={icon}
              alt={course.provider}
              className="w-7 h-7"
              width={28}
              height={28}
              style={{ objectFit: 'contain', maxHeight: 28, maxWidth: 28 }}
            />
          </div>
          <span className="font-medium text-white flex-1">
            {course.provider}
          </span>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation()
              setIsSaved(!isSaved)
            }}
          >
            <BookmarkIcon
              className={`w-5 h-5 ${isSaved ? 'text-white' : 'text-white/70'} transition-colors`}
              fill={isSaved ? 'white' : 'transparent'}
            />
          </button>
        </div>
        <div className="text-lg pt-2 font-medium text-white mb-6 line-clamp-2">
          {course.title
            .replace('para Iniciantes', 'Básico')
            .replace('Intermediário', 'Intermediário')}
        </div>
        <div className="flex gap-2 mt-auto">
          <span className="bg-white/30 text-white px-3 py-1 rounded-full text-xs font-medium">
            {course.workload}h
          </span>
          <span className="bg-white/30 text-white px-3 py-1 rounded-full text-xs font-medium">
            {course.modality}
          </span>
        </div>
      </div>
    </CourseDrawer>
  )
}
