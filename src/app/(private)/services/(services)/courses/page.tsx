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
    description:
      'Aprenda os fundamentos da informática, como uso de computadores, internet e principais softwares.',
    requirements: ['Idade mínima de 14 anos', 'Ensino fundamental completo'],
    spots: 30,
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
    description:
      'Introdução às técnicas de marcenaria com foco em segurança, ferramentas e montagem de móveis simples.',
    requirements: ['Idade mínima de 16 anos', 'Noções básicas de matemática'],
    spots: 18,
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
    description:
      'Capacitação para promover práticas sustentáveis e educação ambiental no ambiente escolar.',
    requirements: [
      'Ser profissional da educação',
      'Atuação em escolas públicas ou privadas',
    ],
    spots: 25,
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
    description:
      'Curso voltado à qualificação de profissionais na manutenção e recuperação de vias urbanas.',
    requirements: [
      'Ensino médio completo',
      'Conhecimentos básicos em obras civis',
    ],
    spots: 40,
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
    description:
      'Explore os conceitos básicos da inteligência artificial, aplicações e ferramentas atuais.',
    requirements: [
      'Noções de lógica de programação',
      'Computador com acesso à internet',
    ],
    spots: 22,
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
    description:
      'Aprenda sobre tecnologias atuais e como aplicá-las no dia a dia pessoal e profissional.',
    requirements: [
      'Ensino fundamental completo',
      'Celular ou computador com acesso à internet',
    ],
    spots: 45,
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
    description:
      'Capacitação para professores e educadores aplicarem robótica como ferramenta de ensino.',
    requirements: [
      'Ser educador ou estudante de licenciatura',
      'Conhecimentos básicos de informática',
    ],
    spots: 16,
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
    description:
      'Curso voltado ao uso de tecnologias digitais na educação e inovação em sala de aula.',
    requirements: [
      'Ser professor da rede pública ou privada',
      'Possuir conta Google para acesso às ferramentas',
    ],
    spots: 28,
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
    description:
      'Aprenda técnicas e práticas de construção com foco na sustentabilidade ambiental e eficiência energética.',
    requirements: [
      'Ensino médio completo',
      'Conhecimentos em construção civil',
    ],
    spots: 35,
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
    description:
      'Curso introdutório sobre lógica de programação, variáveis, estruturas de controle e algoritmos.',
    requirements: [
      'Computador com acesso à internet',
      'Nenhum conhecimento prévio necessário',
    ],
    spots: 50,
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
