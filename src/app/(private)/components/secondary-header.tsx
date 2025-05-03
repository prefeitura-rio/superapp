import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface SecondaryHeaderProps {
  title: string
}

export function SecondaryHeader({ title }: SecondaryHeaderProps) {
  return (
    <header className="p-4 pt-6 fixed top-0 flex items-center w-full justify-center max-w-md mx-auto z-50 bg-background text-white shadow-md h-16">
      <Link href="/" className="mr-4 absolute left-4 flex items-center h-full">
        <ArrowLeft className="h-7 w-7" />
      </Link>
      <h1 className="text-xl font-medium w-full text-center flex items-center justify-center h-full">
        {title}
      </h1>
    </header>
  )
}
