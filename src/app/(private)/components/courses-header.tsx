'use client'

import { ChevronLeft, ListFilter, Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CoursesHeader() {
  const router = useRouter()
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-background text-white px-4 py-3 shadow">
      <div className="mx-auto md:px-4 flex max-w-md items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="relative p-4 cursor-pointer rounded-full bg-zinc-800"
        >
          <span className="flex items-center justify-center bg-muted rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </span>
          <span className="sr-only">Back</span>
        </button>

        <div className="flex items-center space-x-2">
          <Link href="courses/search" className="rounded-full bg-zinc-800 p-4">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Link>

          <Link href="courses/options" className="rounded-full bg-zinc-800 p-4">
            <ListFilter className="h-5 w-5" />
            <span className="sr-only">Options</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
