'use client'

import CoursesHeader from '@/app/(private)/components/courses-header'
import RecentlyAddedCourses from '@/app/(private)/components/recently-added-courses'
import RecommendedCoursesCards from '@/app/(private)/components/recommended-courses-cards'
import { Badge } from '@/components/ui/badge'

import { useState } from 'react'

const FILTERS = [
  { label: 'Todos', value: 'all' },
  { label: 'IA', value: 'ai' },
  { label: 'Tecnologia', value: 'technology' },
  { label: 'Construção', value: 'construction' },
  { label: 'Meio Ambiente', value: 'environment' },
  { label: 'Educação', value: 'education' },
]

const COURSES = [
  {
    id: 1,
    title: 'Informática Básico para Iniciantes',
    status: 'Aberto',
    date: '25.05.2024',
    provider: 'Prefeitura',
    workload: '40h',
    modality: 'Presencial',
    type: 'technology',
    recommended: true,
    recentlyAdded: true,
  },
  {
    id: 2,
    title: 'Curso de Marcenaria Básica',
    status: 'Encerrado',
    date: '13.04.2024',
    provider: 'SENAC',
    workload: '60h',
    modality: 'Presencial',
    type: 'construction',
    recommended: true,
    recentlyAdded: true,
  },
  {
    id: 3,
    title: 'Educação Ambiental nas Escolas',
    status: 'Aberto',
    date: '18.06.2024',
    provider: 'Prefeitura',
    workload: '25h',
    modality: 'Presencial',
    type: 'environment',
    recommended: true,
    recentlyAdded: true,
  },
  {
    id: 4,
    title: 'Recapeamento/recuperação de asfalto',
    status: 'Aberto',
    date: '03.03.2024',
    provider: 'Prefeitura',
    workload: '50h',
    modality: 'Híbrido',
    type: 'construction',
    recommended: false,
    recentlyAdded: false,
  },
  {
    id: 5,
    title: 'Introdução à Inteligência Artificial',
    status: 'Aberto',
    date: '10.06.2024',
    provider: 'SENAC',
    workload: '20h',
    modality: 'Remoto',
    type: 'ai',
    recommended: true,
    recentlyAdded: true,
  },
  {
    id: 6,
    title: 'Tecnoligia Básica e Aplicada',
    status: 'Aberto',
    date: '03.03.2024',
    provider: 'Google',
    workload: '30h',
    modality: 'Remoto',
    type: 'technology',
    recommended: true,
    recentlyAdded: true,
  },
  {
    id: 7,
    title: 'Robótica Educacional',
    status: 'Encerrado',
    date: '02.05.2024',
    provider: 'SENAI',
    workload: '35h',
    modality: 'Presencial',
    type: 'technology',
    recommended: false,
    recentlyAdded: false,
  },
  {
    id: 8,
    title: 'Capacitação de Professores em Educação Digital',
    status: 'Aberto',
    date: '22.06.2024',
    provider: 'Google',
    workload: '15h',
    modality: 'Remoto',
    type: 'education',
    recommended: true,
    recentlyAdded: true,
  },
  {
    id: 9,
    title: 'Construção Sustentável',
    status: 'Aberto',
    date: '30.06.2024',
    provider: 'SENAI',
    workload: '45h',
    modality: 'Híbrido',
    type: 'construction',
    recommended: false,
    recentlyAdded: true,
  },
  {
    id: 10,
    title: 'Fundamentos de Programação',
    status: 'Aberto',
    date: '05.07.2024',
    provider: 'Prefeitura',
    workload: '40h',
    modality: 'Remoto',
    type: 'technology',
    recommended: true,
    recentlyAdded: false,
  },
]

export default function CoursePage() {
  const [selected, setSelected] = useState('all')

  const filteredCourses =
    selected === 'all'
      ? COURSES
      : COURSES.filter(course => course.type === selected)

  return (
    <div className="min-h-lvh">
      <CoursesHeader />
      <main className="max-w-md mx-auto pt-15 text-white">
        <section className="relative">
          <h2 className="px-5 text-4xl font-medium mb-2 bg-background z-10 pt-7 pb-3">
            Seu curso <br /> Começa aqui
          </h2>
          {/* Scrollable Filters */}
          <div className="relative w-full overflow-x-auto px-5 pb-4 no-scrollbar">
            <div className="flex gap-3 min-w-max">
              {FILTERS.map(filter => (
                <Badge
                  key={filter.value}
                  onClick={() => setSelected(filter.value)}
                  className={`cursor-pointer px-3 py-1 rounded-full text-sm transition-colors
                ${
                  selected === filter.value
                    ? 'bg-white text-black'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }
              `}
                  variant={selected === filter.value ? 'secondary' : 'outline'}
                >
                  {filter.label}
                </Badge>
              ))}
            </div>
          </div>
        </section>
        <RecommendedCoursesCards courses={filteredCourses} />
        <RecentlyAddedCourses courses={filteredCourses} />
      </main>
    </div>
  )
}
