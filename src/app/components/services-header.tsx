'use client'

import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ServicesHeaderProps {
  title: string
}

export function ServicesHeader({ title }: ServicesHeaderProps) {
  const router = useRouter()
  return (
    <>
      <header className="p-4 fixed top-0 flex items-center w-full justify-center max-w-4xl mx-auto z-50 bg-background text-white h-19">
        <button
          type="button"
          onClick={() => router.back()}
          className="mr-4 absolute left-4 flex items-center h-full"
        >
          <span className="flex items-center justify-center bg-muted rounded-full w-13 h-13">
            <ChevronLeft className="h-5 w-5" />
          </span>
        </button>
        <h1 className="text-xl font-medium w-full text-center flex items-center justify-center h-full">
          {title}
        </h1>
      </header>
    </>
  )
}
