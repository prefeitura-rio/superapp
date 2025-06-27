'use client'

import { SearchInput } from '@/components/ui/custom/search-input'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Search() {
  const router = useRouter()

  const suggestions = [
    'Quero pagar meu IPTU',
    'Matricular meu filho na escola',
    'Procurar emprego',
    'Cadastrar evento',
  ]

  return (
    <div className="max-w-md mx-auto pt-10 flex flex-col space-y-6">
      <SearchInput
        placeholder="O que você precisa?"
        onBack={() => router.back()}
        onClear={() => console.log('Search cleared')}
      />

      <div className="text-white space-y-3">
        <h2 className="text-sm font-semibold text-neutral-400">Sugestões</h2>
        <ul className="space-y-2">
          {suggestions.map((text, index) => (
            <li
              key={index}
              className="flex justify-between items-center py-2 border-b border-neutral-800 cursor-pointer hover:text-white hover:bg-neutral-800 rounded-md px-2"
            >
              <span>{text}</span>
              <ArrowRight className="h-4 w-4" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
