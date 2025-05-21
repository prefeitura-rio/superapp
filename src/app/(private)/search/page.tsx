'use client'

import { SearchInput } from '@/components/ui/custom/search-input'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CategoryGrid } from '../components/category-grid'
import { ServiceCategories } from '../components/service-categories'

export default function Search() {
  const router = useRouter()

  const suggestions = [
    'Quero pagar meu IPTU',
    'Matricular meu filho na escola',
    'Procurar emprego',
    'Cadastrar evento',
  ]

  const categories = ServiceCategories()

  return (
    <>
      <div className="max-w-md px-5 mx-auto pt-5 flex flex-col space-y-6 pb-4">
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
      </div>
      <div className="max-w-md mx-auto">
        <CategoryGrid title="Categorias" categories={categories} />
      </div>
    </>
  )
}
