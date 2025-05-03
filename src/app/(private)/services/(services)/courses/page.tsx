import CourseList from '@/app/(private)/components/course-list'
import FilterButtons from '@/app/(private)/components/filter-buttons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default function CoursePage() {
  return (
    <main className="min-h-screen bg-background text-white pb-20">
      <div className="container max-w-md mx-auto px-4 py-6">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-medium">Encontre seu curso</h1>
          <Button variant="ghost" size="icon" className="text-white">
            <span className="sr-only">Menu</span>-
          </Button>
        </header>

        <div className="relative mb-6">
          <Input
            type="search"
            placeholder="Pesquisar por curso..."
            className="bg-gray-800 border-none rounded-lg pl-4 pr-10 py-6 w-full text-white placeholder:text-gray-400"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>

        <FilterButtons />

        <CourseList
          title="Cursos em destaque"
          courses={[
            {
              id: 1,
              name: 'Marcenaria',
              institution: 'SENAC',
              location: 'Botafogo, Centro Sergio Buarque',
              hours: 120,
              color: 'bg-yellow-100',
            },
            {
              id: 2,
              name: 'Fundamentos de TI',
              institution: 'Google',
              location: 'Centro, Centro Maria Silva',
              hours: 60,
              color: 'bg-orange-100',
            },
            {
              id: 3,
              name: 'Solda',
              institution: 'SENAC',
              location: 'Botafogo, Centro Sergio Buarque',
              hours: 60,
              color: 'bg-purple-100',
            },
          ]}
        />

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Meus cursos</h2>
            <Button variant="link" className="text-white text-sm p-0">
              Ver tudo
            </Button>
          </div>

          <CourseList
            courses={[
              {
                id: 1,
                name: 'Informática Básico',
                institution: 'Google',
                location: 'Maracanã, Centro Maria Almeida',
                hours: 100,
                color: 'bg-green-100',
              },
              {
                id: 2,
                name: 'Marcenaria',
                institution: 'SENAI',
                location: 'Botafogo, Centro Marechal Maciel',
                hours: 60,
                color: 'bg-blue-200',
              },
            ]}
          />
        </div>
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Recentes</h2>
          </div>

          <CourseList
            courses={[
              {
                id: 1,
                name: 'Marcenaria',
                institution: 'SENAI',
                location: 'Cidade Nova, Escola de Marcenaria',
                hours: 36,
                color: 'bg-red-100',
              },
              {
                id: 2,
                name: 'Informatica Básico',
                institution: 'SENAI',
                location: 'Santa Tereza, Centro Maria Almeida',
                hours: 60,
                color: 'bg-purple-100',
              },
            ]}
          />
        </div>
      </div>
    </main>
  )
}
