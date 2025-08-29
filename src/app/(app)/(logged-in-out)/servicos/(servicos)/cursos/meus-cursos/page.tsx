'use client'

import { MyCoursesCard } from '@/app/components/courses/my-course-card'
import { SecondaryHeader } from '@/app/components/secondary-header'

export default function MyCoursesPage() {

  return (
    <div className="max-w-4xl mx-auto py-6">
      <SecondaryHeader title="Meus cursos" route="/servicos/cursos/opcoes" />
      <div className="relative overflow-hidden mt-16 px-4">
        <MyCoursesCard />
      </div>
    </div>
  )
}
