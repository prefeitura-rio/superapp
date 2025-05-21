'use client'

import { SearchInput } from '@/components/ui/custom/search-input'
import {
  ArrowRight,
  BadgePercent,
  BookOpen,
  Briefcase,
  Calendar,
  File,
  FileText,
  GraduationCap,
  Home,
  IdCard,
  PawPrint,
  Users,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Search() {
  const router = useRouter()

  const suggestions = [
    'Quero pagar meu IPTU',
    'Matricular meu filho na escola',
    'Procurar emprego',
    'Cadastrar evento',
  ]

  const categories = [
    {
      name: 'IPTU',
      icon: <BadgePercent className="h-7 w-7" />,
      tag: 'desconto',
    },
    { name: 'CAD Rio', icon: <Calendar className="h-7 w-7" /> },
    { name: 'ITBI', icon: <Home className="h-7 w-7" /> },
    { name: 'Alvará', icon: <FileText className="h-7 w-7" /> },
    { name: 'Emprego', icon: <Briefcase className="h-7 w-7" /> },
    { name: 'Cursos', icon: <BookOpen className="h-7 w-7" /> },
    { name: 'Cartão Idoso', icon: <IdCard className="h-7 w-7" /> },
    { name: 'Matrícula', icon: <GraduationCap className="h-7 w-7" /> },
    { name: 'Pets', icon: <PawPrint className="h-7 w-7" /> },
    { name: 'CRAS', icon: <Users className="h-7 w-7" /> },
    { name: 'ISS', icon: <File className="h-7 w-7" /> },
  ]

  return (
    <div className="max-w-md px-5 mx-auto pt-10 flex flex-col space-y-6 pb-10">
      <SearchInput
        placeholder="O que você precisa?"
        onBack={() => router.back()}
        onClear={() => console.log('Search cleared')}
      />

      {/* Sugestões */}
      <div className="text-white space-y-3">
        <h2 className="text-lg font-semibold">Sugestões</h2>
        <ul>
          {suggestions.map((text, index) => (
            <li
              key={index}
              className="text-sm text-gray-300 flex justify-between items-center py-4 border-b border-neutral-800 cursor-pointer"
            >
              <span>{text}</span>
              <ArrowRight className="text-white h-5 w-5" />
            </li>
          ))}
        </ul>
      </div>

      {/* Categorias */}
      <div className="text-white space-y-4">
        <h2 className="text-lg font-semibold">Categorias</h2>
        <div className="grid grid-cols-3 gap-4">
          {categories.map((category, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="relative bg-neutral-900 w-full aspect-square rounded-xl flex items-center justify-center hover:bg-neutral-800 transition border-2 border-gray-200">
                <div className="flex items-center justify-center w-full h-full">
                  {category.icon}
                </div>
                {category.tag && (
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-2 text-xs text-white bg-orange-600 px-2 py-0.5 rounded-full">
                    {category.tag}
                  </span>
                )}
              </div>
              <span className="mt-2 text-sm text-center">{category.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
