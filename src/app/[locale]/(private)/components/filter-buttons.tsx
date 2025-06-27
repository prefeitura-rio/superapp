'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'

const filters = [
  { id: 'all', label: 'Todos' },
  { id: 'ai', label: 'IA' },
  { id: 'tech', label: 'Tecnologia' },
  { id: 'construction', label: 'Construção' },
  { id: 'construction2', label: 'Construção' },
  { id: 'construction3', label: 'Construção' },
]

export default function FilterButtons() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['all'])

  const toggleFilter = (filterId: string) => {
    if (filterId === 'all') {
      setSelectedFilters(['all'])
      return
    }

    // Remove "all" when selecting a specific filter
    const newFilters = selectedFilters.filter(id => id !== 'all')

    if (selectedFilters.includes(filterId)) {
      // If this is the last filter and we're removing it, select "all"
      if (newFilters.length === 1 && newFilters[0] === filterId) {
        setSelectedFilters(['all'])
      } else {
        // Otherwise just remove this filter
        setSelectedFilters(newFilters.filter(id => id !== filterId))
      }
    } else {
      // Add this filter
      setSelectedFilters([...newFilters, filterId])
    }
  }

  return (
    <div className="relative -mx-4 px-4 mb-6">
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-4 -mx-4">
        {filters.map(filter => (
          <Button
            key={filter.id}
            variant="outline"
            size="sm"
            className={`rounded-full px-4 py-1 h-auto text-sm flex-shrink-0 ${
              selectedFilters.includes(filter.id)
                ? 'bg-white text-black'
                : 'bg-transparent text-white border-gray-700'
            }`}
            onClick={() => toggleFilter(filter.id)}
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
